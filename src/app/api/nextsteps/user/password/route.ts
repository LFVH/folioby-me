import { NextRequest, NextResponse } from 'next/server'
import { LIMITES } from '@/lib/limits'
import { userService } from '@/app/services/userService'
import { verifyUser } from '@/utils/verifyUserAuth';

export async function PUT(request: NextRequest) {
  try {
    const authResult = await verifyUser();
    if (authResult instanceof NextResponse) return authResult;
    const { userId, isPremium } = authResult;
    if (!isPremium) {
      return NextResponse.json(
        { error: '404 Not Found' },
        { status: 403 }
      )
    }


    const { password } = await request.json()
    
    if (typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'Senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    if (password.length > LIMITES.senhaMax) {
      return NextResponse.json(
        { error: `Senha deve ter no máximo ${LIMITES.senhaMax} caracteres` },
        { status: 400 }
      )
    }

    await userService.updatePassword(userId, password)
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error updating password:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar senha' },
      { status: 500 }
    )
  }
}
