// app/api/nextsteps/conteudo/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { verifyUser } from '@/utils/verifyUserAuth';


export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyUser();
    if (authResult instanceof NextResponse) return authResult;
    const { userId, isPremium } = authResult;

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }
    const allowedTypes = ['image/gif', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Formato não suportado. Use GIF, JPEG, PNG, WebP ou AVIF.' 
      }, { status: 400 });
    }
    const blob = await put(`nextsteps/${Date.now()}-${file.name}`, file, {
      access: 'public',
      addRandomSuffix: true,
    });

    return NextResponse.json({ 
      success: true, 
      url: blob.url,
      filename: file.name,
      mimetype: file.type,
      size: file.size
    });

  } catch (error) {
    console.error('Erro no upload:', error);
    return NextResponse.json({ 
      error: 'Erro ao fazer upload do arquivo' 
    }, { status: 500 });
  }
}