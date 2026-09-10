import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { checkUserStorageQuotaByDelta, MAX_SINGLE_UPLOAD_BYTES, MAX_USER_STORAGE_BYTES } from '@/lib/storage-quota';
import { verifyUser } from '@/utils/verifyUserAuth';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as HandleUploadBody;

    if (body.type === 'blob.generate-client-token') {
      const authResult = await verifyUser();
      if (authResult instanceof NextResponse) {
        return authResult;
      }

      const parsedClientPayload =
        typeof body.payload.clientPayload === 'string' && body.payload.clientPayload.trim()
          ? JSON.parse(body.payload.clientPayload)
          : {};

      const requestedBytes = Number(parsedClientPayload.storageBytes ?? parsedClientPayload.size ?? 0);
      const quota = await checkUserStorageQuotaByDelta(authResult.userId, requestedBytes);

      if (!quota.allowed) {
        throw new Error(quota.message);
      }
    }

    const jsonResponse = await handleUpload({
      body,
      request,

      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: [
            'image/gif',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
            'image/avif'
          ],
          maximumSizeInBytes: MAX_SINGLE_UPLOAD_BYTES,
        };
      },

      onUploadCompleted: async ({ blob }) => {
        try {
          console.log('Upload finalizado:', blob.url);
        } catch (error) {
          console.error('Erro pós upload:', error);
        }
      },
    });

    return NextResponse.json(jsonResponse);

  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : 'Erro ao fazer upload';

    console.error('Erro upload blob:', error);

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