// app/api/nextsteps/user/image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { BlobService } from '@/lib/blob-service';
import { verifyUser } from '@/utils/verifyUserAuth';
import prisma from '@/prisma';

// POST - Upload de nova imagem
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyUser();
    if (authResult instanceof NextResponse) return authResult;
    const { userId, isPremium } = authResult;

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    // Validar imagem
    const validation = BlobService.validateImage(file);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Verificar tamanho (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 5MB.' },
        { status: 400 }
      );
    }

    const path = `nextsteps/users/${userId}/profile/${Date.now()}-${file.name}`;
    
    // Upload para o blob
    const uploaded = await BlobService.uploadFromClient(file, path);

    return NextResponse.json({
      url: uploaded.url,
      filename: uploaded.filename,
      size: uploaded.size
    });

  } catch (error) {
    console.error('Erro no upload:', error);
    return NextResponse.json(
      { error: 'Erro interno ao fazer upload' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar URL da imagem no perfil
export async function PUT(request: NextRequest) {
  try {
    const authResult = await verifyUser();
    if (authResult instanceof NextResponse) return authResult;
    const { userId, isPremium } = authResult;

    const { imageUrl, oldImageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'URL da imagem é obrigatória' },
        { status: 400 }
      );
    }
    await prisma.usuario.update({
      where: { id: userId },
      data: { image: imageUrl }
    });

    // Se tinha uma imagem antiga, deleta do blob (opcional)
    if (oldImageUrl && oldImageUrl.includes('vercel-storage.com')) {
      try {
        await BlobService.deleteFile(oldImageUrl);
      } catch (deleteError) {
        console.error('Erro ao deletar imagem antiga:', deleteError);
        // Não falha a requisição se não conseguir deletar
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Imagem atualizada com sucesso' 
    });

  } catch (error) {
    console.error('Erro ao atualizar imagem:', error);
    return NextResponse.json(
      { error: 'Erro interno ao atualizar imagem' },
      { status: 500 }
    );
  }
}

// DELETE - Remover imagem
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await verifyUser();
    if (authResult instanceof NextResponse) return authResult;
    const { userId, isPremium } = authResult;

    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'URL da imagem é obrigatória' },
        { status: 400 }
      );
    }

    // Deletar do blob
    await BlobService.deleteFile(imageUrl);

     await prisma.usuario.update({
       where: { id: userId },
       data: { image: null }
     });

    return NextResponse.json({ 
      success: true,
      message: 'Imagem removida com sucesso' 
    });

  } catch (error) {
    console.error('Erro ao remover imagem:', error);
    return NextResponse.json(
      { error: 'Erro interno ao remover imagem' },
      { status: 500 }
    );
  }
}