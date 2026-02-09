// app/api/user/image/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyUser } from '@/utils/verifyUserAuth';
import { userService } from '@/app/services/userService';

export async function PUT(request: NextRequest) {
  try {
    const authResult = await verifyUser();
    if (authResult instanceof NextResponse) return authResult;
    const { userId, isPremium } = authResult;

    const { imageUrl } = await request.json()
    
    const updatedUser = await userService.updateProfileImage(userId, imageUrl)
    
    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error: any) {
    console.error('Error updating image:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar imagem' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await verifyUser();
    if (authResult instanceof NextResponse) return authResult;
    const { userId, isPremium } = authResult;

    const updatedUser = await userService.updateProfileImage(userId, null)
    
    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error: any) {
    console.error('Error removing image:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao remover imagem' },
      { status: 500 }
    )
  }
}