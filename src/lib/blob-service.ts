// lib/blob-service.ts
import { put, del, list } from '@vercel/blob';
import prisma from '@/prisma';

export interface UploadedFile {
  url: string;
  filename: string;
  mimetype: string;
  size: number;
}

export class BlobService {
  /**
   * Upload direto do frontend (recomendado)
   */
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

  /**
   * Upload via server (para compatibilidade com código existente)
   */
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

  /**
   * Deletar arquivo do Blob
   */
  static async deleteFile(url: string) {
    try {
      await del(url);
    } catch (error) {
      console.error('Erro ao deletar arquivo do Blob:', error);
    }
  }

  /**
   * Upload de múltiplas imagens (para sequências)
   */
  static async uploadMultiple(files: File[], basePath: string): Promise<UploadedFile[]> {
    const uploads = await Promise.all(
      files.map(async (file, index) => {
        const path = `${basePath}/${index}-${file.name}`;
        return this.uploadFromClient(file, path);
      })
    );
    return uploads;
  }

  /**
   * Valida arquivo de imagem
   */
  static validateImage(file: File): { valid: boolean; error?: string } {
    const allowedTypes = [
      'image/gif',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/avif'
    ];
    
    const maxSize = 500 * 1024 * 1024; // 500MB (limite do Vercel Blob free)
    
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