// app/api/user/slug/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { userService } from '@/app/services/userService'
import { verifyUser } from '@/utils/verifyUserAuth';

export async function PUT(request: NextRequest) {
  try {
    const authResult = await verifyUser();
    if (authResult instanceof NextResponse) return authResult;
    const { userId, isPremium } = authResult;

    const { slug } = await request.json()
    
    if (!slug) {
      return NextResponse.json({ error: 'Slug é obrigatório' }, { status: 400 })
    }

    const updatedUser = await userService.updateSlug(userId, slug)
    
    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error: any) {
    console.error('Error updating slug:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar slug' },
      { status: 500 }
    )
  }
}