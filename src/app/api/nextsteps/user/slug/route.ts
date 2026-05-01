// app/api/user/slug/route.ts
import { NextRequest, NextResponse } from 'next/server'

import { userService } from '@/app/services/userService'
import { refreshSlugCache } from '@/lib/db/slug-service'
import { UserSlugError } from '@/lib/user-slug'
import { verifyUser } from '@/utils/verifyUserAuth'

export async function PUT(request: NextRequest) {
  try {
    const authResult = await verifyUser()
    if (authResult instanceof NextResponse) return authResult

    const { userId } = authResult
    const { slug } = await request.json()

    const updatedUser = await userService.updateSlug(userId, slug)
    await refreshSlugCache()

    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error: any) {
    console.error('Error updating slug:', error)

    const status = error instanceof UserSlugError ? error.status : 500

    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar slug' },
      { status }
    )
  }
}
