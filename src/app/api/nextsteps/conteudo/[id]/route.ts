import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../prisma";
import { isHis, verifyUser } from "@/utils/verifyUserAuth";
import { BlobService } from "@/lib/blob-service";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; }>; }
) {
  try {
    const authResult = await verifyUser();
    if (authResult instanceof NextResponse) return authResult;
    const { userId, isPremium } = authResult;
    const id = parseInt((await params).id, 10);
    if (isNaN(id)) return NextResponse.json({ message: "id inválido" }, { status: 400 });
    if((!isPremium && await isHis(userId, id))) return NextResponse.json(
        { success: false, error: '404 Not Found' },
        { status: 403 }
      )
    await prisma.conteudo.delete({
      where: { id: id }
    })

    return NextResponse.json({
      success: true,
      message: 'Conteúdo excluído com sucesso'
    })
  } catch (error) {
    console.error('Erro ao excluir conteúdo:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; }>; }
) {
  try {
    const authResult = await verifyUser();
    if (authResult instanceof NextResponse) return authResult;
    const { userId, isPremium } = authResult;
    
    const id = parseInt((await params).id, 10);
    if (isNaN(id)) return NextResponse.json({ message: "id inválido" }, { status: 400 });
    
    if(!isPremium && await isHis(userId, id)) return NextResponse.json(
      { success: false, error: '404 Not Found' },
      { status: 403 }
    )
    
    const conteudo = await prisma.conteudo.findUnique({
      where: { id: id }
    })

    if (!conteudo) {
      return NextResponse.json(
        { error: 'Conteúdo não encontrado' },
        { status: 404 }
      )
    }

    // ✅ REDIRECIONAR PARA A URL DO BLOB (se existir)
    if (conteudo.link) {
      return NextResponse.redirect(conteudo.link, 302)
    }

    // ⚠️ FALLBACK para dados antigos (se ainda tiver data)
    if (conteudo.data) {
      const buffer = Buffer.from(conteudo.data)
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': conteudo.mimetype || 'image/gif',
          'Content-Disposition': `inline; filename="${conteudo.filename}"`,
          'Content-Length': buffer.length.toString(),
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      })
    }

    return NextResponse.json(
      { error: 'Conteúdo sem arquivo' },
      { status: 404 }
    )

  } catch (error) {
    console.error('Erro ao buscar conteúdo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; }>; }
) {
  try {
    const authResult = await verifyUser();
    if (authResult instanceof NextResponse) return authResult;
    const { userId, isPremium } = authResult;
    const id = parseInt((await params).id, 10);
    if (isNaN(id)) return NextResponse.json({ message: "id inválido" }, { status: 400 });
    if(!isPremium && await isHis(userId, id)) return NextResponse.json(
      { success: false, error: '404 Not Found' },
      { status: 403 }
    )
    const formData = await request.formData()
    const conteudoExistente = await prisma.conteudo.findUnique({
      where: { id: id }
    })

    if (!conteudoExistente) {
      return NextResponse.json(
        { success: false, error: 'Conteudo não encontrada' },
        { status: 404 }
      )
    }
    const name = formData.get('name') as string
    const fonte = formData.get('fonte') as string
    const link = formData.get('link') as string
    const linkext = formData.get('linkext') as string
    const categoriasIds = formData.get('categoriasIds') as string
   const newFile = formData.get('file') as File | null;
    const isSequence = formData.get('isSequence') === 'true';
    const files = formData.getAll('files') as File[];

    let updateData: any = {
      name,
      fonte,
      linkext,
      updatedAt: new Date()
    };

    // Processar novo arquivo se enviado
    if (isSequence && files.length > 0) {
      // Deletar arquivos antigos do Blob
      if (conteudoExistente.mediaUrls?.length > 0) {
        for (const url of conteudoExistente.mediaUrls) {
          await BlobService.deleteFile(url);
        }
      }
      
      // Upload das novas imagens
      const uploads = await BlobService.uploadMultiple(files, `nextsteps/sequences/${Date.now()}`);
      const urls = uploads.map(u => u.url);
      
      updateData.link = urls[0];
      updateData.filename = files[0].name;
      updateData.mimetype = 'image/sequence';
      updateData.mediaType = 'sequence';
      updateData.mediaUrls = urls;
      updateData.data = Buffer.from('');
      
    } else if (newFile) {
      // Deletar arquivo antigo do Blob
      if (conteudoExistente.link?.includes('public.blob.vercel-storage.com')) {
        await BlobService.deleteFile(conteudoExistente.link);
      }
      
      // Upload do novo arquivo
      const buffer = Buffer.from(await newFile.arrayBuffer());
      const upload = await BlobService.uploadFromServer(
        buffer,
        newFile.name,
        newFile.type
      );
      
      updateData.link = upload.url;
      updateData.filename = upload.filename;
      updateData.mimetype = upload.mimetype;
      updateData.mediaType = 'single';
      updateData.mediaUrls = [upload.url];
      updateData.data = Buffer.from('');
    }

    // Processar categorias
    if (categoriasIds) {
      const categoriasConnect = categoriasIds.split(',').map(id => ({ id: parseInt(id) }))
      updateData.categorias = {
        set: categoriasConnect
      }
    }

    const conteudo = await prisma.conteudo.update({
      where: { id: parseInt((await  params).id) },
      data: updateData,
      include: {
        categorias: true
      }
    })

    return NextResponse.json({
      success: true,
      data: conteudo,
      message: 'Conteúdo atualizado com sucesso'
    })
  } catch (error) {
    console.error('Erro ao atualizar conteúdo:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; }>; }
) {
  try {
    const authResult = await verifyUser();
    if (authResult instanceof NextResponse) return authResult;
    const { userId, isPremium } = authResult;
    const id = parseInt((await params).id, 10);
    if (isNaN(id)) return NextResponse.json({ message: "id inválido" }, { status: 400 });
    if(!isPremium && await isHis(userId, id)) return NextResponse.json(
        { success: false, error: '404 Not Found' },
        { status: 403 }
      ) 
    const conteudoExistente = await prisma.conteudo.findUnique({
      where: { id: id }
    })

    if (!conteudoExistente) {
      return NextResponse.json(
        { success: false, error: 'Conteudo não encontrad' },
        { status: 404 }
      )
    }
        const body = await request.json()
    const { toggle } = body
    if(!toggle) {
      return NextResponse.json(
        { success: false, error: 'O que fazer?' },
        { status: 404 }
      )
    }
    let conteudo;
    if (toggle ==='istrend'){
      conteudo = await prisma.conteudo.update({
      where: { id: id },
      data: {
        isTrend: !conteudoExistente.isTrend
      },
    })
  }
    return NextResponse.json({
      success: true,
      data: conteudo,
      message: 'Atualizada com sucesso'
    })
  } catch (error: any) {
    console.error('Erro ao atualizar conteudo:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}