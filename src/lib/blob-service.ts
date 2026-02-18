import { put, del, list } from '@vercel/blob';
export interface UploadedFile {
  url: string;
  filename: string;
  mimetype: string;
  size: number;
}
export class BlobService {
  static async uploadFromClient(file: File, path: string): Promise<UploadedFile> {
    const blob = await put(path, file, {
      access: 'public',
      addRandomSuffix: true,
    });
    return {
      url: blob.url,
      filename: file.name,
      mimetype: file.type,
      size: file.size,
    };
  }
  static async uploadFromServer(buffer: Buffer, filename: string, mimetype: string): Promise<UploadedFile> {
    const path = `nextsteps/${Date.now()}-${filename}`;
    const blob = await put(path, buffer, {
      access: 'public',
      addRandomSuffix: false,
      contentType: mimetype,
    });
    return {
      url: blob.url,
      filename,
      mimetype,
      size: buffer.length,
    };
  }
  static async deleteFile(url: string) {
    try {
      await del(url);
    } catch (error) {
      console.error('Erro ao deletar arquivo do Blob:', error);
    }
  }
  static async uploadMultiple(files: File[], basePath: string): Promise<UploadedFile[]> {
    const uploads = await Promise.all(
      files.map(async (file, index) => {
        const path = `${basePath}/${index}-${file.name}`;
        return this.uploadFromClient(file, path);
      })
    );
    return uploads;
  }
  static validateImage(file: File): { valid: boolean; error?: string } {
    const allowedTypes = [
      'image/gif',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/avif'
    ];
    const maxSize = 500 * 1024 * 1024;
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Formato não suportado. Use GIF, JPEG, PNG, WebP ou AVIF.'
      };
    }
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'Arquivo muito grande. Máximo 500MB.'
      };
    }
    return { valid: true };
  }
}