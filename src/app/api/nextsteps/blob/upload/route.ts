import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as HandleUploadBody;

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
          maximumSizeInBytes: 1024 * 1024 * 25, // 500MB
        };
      },

      onUploadCompleted: async ({ blob }) => {
        try {
          console.log('Upload finalizado:', blob.url);

          // aqui você pode salvar no banco se quiser

        } catch (error) {
          console.error('Erro pós upload:', error);
        }
      },
    });

    return NextResponse.json(jsonResponse);

  } catch (error) {
    console.error('Erro upload blob:', error);

    return NextResponse.json(
      {
        error: 'Erro ao fazer upload',
      },
      {
        status: 500,
      }
    );
  }
}