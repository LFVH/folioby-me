import { NextRequest, NextResponse } from 'next/server'
import prisma from "@/database/prisma"
import { isActuallyChief, verifyUser } from "@/utils/verifyUserAuth"

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
    if(!isActuallyChief(userId)) return NextResponse.json(
        { success: false, error: '404 Not Found' },
        { status: 403 }
      ) 
    const body = await request.json()
    const { nome, name, descricao } = body

    const categoriaExistente = await prisma.categoria.findUnique({
      where: { id: id}
    })

    if (!categoriaExistente) {
      return NextResponse.json(
        { success: false, error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    const categoria = await prisma.categoria.update({
      where: { id: id },
      data: {
        nome: nome !== undefined ? nome : categoriaExistente.nome,
        name: name !== undefined ? name : categoriaExistente.name,
        descricao: descricao !== undefined ? descricao : categoriaExistente.descricao
      },
      include: {
        _count: {
          select: {
            conteudos: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: categoria,
      message: 'Categoria atualizada com sucesso'
    })
  } catch (error: any) {
    console.error('Erro ao atualizar categoria:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Já existe uma categoria com este nome' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

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
    const categoria = await prisma.categoria.findUnique({
      where: { id: id},
      include: {
        _count: {
          select: {
            conteudos: true
          }
        }
      }
    })

    if (!categoria) {
      return NextResponse.json(
        { success: false, error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    if (categoria._count.conteudos > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Não é possível excluir categoria com conteúdos associados' 
        },
        { status: 400 }
      )
    }

    await prisma.categoria.delete({
      where: { id: id }
    })

    return NextResponse.json({
      success: true,
      message: 'Categoria excluída com sucesso'
    })
  } catch (error) {
    console.error('Erro ao excluir categoria:', error)
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
    const categoria = await prisma.categoria.findUnique({
      where: { id: id },
      include: {
        _count: {
          select: {
            conteudos: true
          }
        }
      }
    })

    if (!categoria) {
      return NextResponse.json(
        { success: false, error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: categoria
    })
  } catch (error) {
    console.error('Erro ao buscar categoria:', error)
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
    if(!isActuallyChief(userId)) return NextResponse.json(
        { success: false, error: '404 Not Found' },
        { status: 403 }
      ) 
    const categoriaExistente = await prisma.categoria.findUnique({
      where: { id: id }
    })

    if (!categoriaExistente) {
      return NextResponse.json(
        { success: false, error: 'Categoria não encontrada' },
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
    let categoria;
    if(toggle ==='isfree'){
      categoria = await prisma.categoria.update({
      where: { id: id },
      data: {
        isFree: !categoriaExistente.isFree
      },
    })
  } else if (toggle ==='istrend'){
      categoria = await prisma.categoria.update({
      where: { id: id },
      data: {
        isTrend: !categoriaExistente.isTrend
      },
    })
  }
    return NextResponse.json({
      success: true,
      data: categoria,
      message: 'Atualizada com sucesso'
    })
  } catch (error: any) {
    console.error('Erro ao atualizar categoria:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}