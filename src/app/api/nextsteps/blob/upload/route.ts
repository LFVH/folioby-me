import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { checkUserStorageQuotaByDelta, formatBytes, getUserStorageStatus, MAX_SINGLE_UPLOAD_BYTES } from '@/lib/storage-quota';
import { verifyUser } from '@/utils/verifyUserAuth';

const ALLOWED_UPLOAD_TYPES = [
  'image/gif',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
];

class UploadRecusado extends Error {}

function lerTamanhoDeclarado(clientPayload: unknown): number {
  let payload: Record<string, unknown> = {};
  if (typeof clientPayload === 'string' && clientPayload.trim()) {
    try {
      payload = JSON.parse(clientPayload);
    } catch {
      throw new UploadRecusado('Dados do arquivo inválidos. Selecione o arquivo de novo.');
    }
  }

  return Number(payload.storageBytes ?? payload.size);
}

// Uso atual e espaço restante, para o formulário avisar antes de enviar.
export async function GET() {
  try {
    const authResult = await verifyUser();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const status = await getUserStorageStatus(authResult.userId);
    return NextResponse.json({ success: true, ...status, maxFileBytes: MAX_SINGLE_UPLOAD_BYTES });
  } catch (error) {
    console.error('Erro ao consultar armazenamento:', error);
    return NextResponse.json({ success: false, error: 'Erro ao consultar armazenamento' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as HandleUploadBody;
    // Limite do token: nunca maior que 500 MB nem que o espaço que sobra na cota do usuário.
    let maximumSizeInBytes = MAX_SINGLE_UPLOAD_BYTES;

    if (body.type === 'blob.generate-client-token') {
      const authResult = await verifyUser();
      if (authResult instanceof NextResponse) {
        return authResult;
      }

      const requestedBytes = lerTamanhoDeclarado(body.payload.clientPayload);
      if (!Number.isFinite(requestedBytes) || requestedBytes <= 0) {
        throw new UploadRecusado('Tamanho do arquivo inválido. Selecione o arquivo de novo.');
      }

      if (requestedBytes > MAX_SINGLE_UPLOAD_BYTES) {
        throw new UploadRecusado(`Arquivo muito grande. Máximo ${formatBytes(MAX_SINGLE_UPLOAD_BYTES)} por arquivo.`);
      }

      const quota = await checkUserStorageQuotaByDelta(authResult.userId, requestedBytes);
      if (!quota.allowed) {
        throw new UploadRecusado(quota.message);
      }

      maximumSizeInBytes = Math.min(MAX_SINGLE_UPLOAD_BYTES, quota.remainingBytes);
    }

    const jsonResponse = await handleUpload({
      body,
      request,

      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: ALLOWED_UPLOAD_TYPES,
          maximumSizeInBytes,
        };
      },

      onUploadCompleted: async () => {},
    });

    return NextResponse.json(jsonResponse);

  } catch (error) {
    const message =
      error instanceof UploadRecusado
        ? error.message
        : 'Erro ao fazer upload';

    if (!(error instanceof UploadRecusado)) {
      console.error('Erro upload blob:', error);
    }

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 400,
      }
    );
  }
}
