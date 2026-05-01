// app/services/userService.ts
import bcrypt from 'bcryptjs'

import { assertAvailableUserSlug } from '@/lib/db/user-slug-service'
import prisma from '@/prisma'

export const userService = {
  async updatePassword(userId: string, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    return await prisma.usuario.update({
      where: { id: userId },
      data: { password: hashedPassword }
    })
  },

  async updateSlug(userId: string, slug: string) {
    const normalizedSlug = await assertAvailableUserSlug(slug, userId)

    return await prisma.usuario.update({
      where: { id: userId },
      data: { slug: normalizedSlug }
    })
  },

  async updateDesc(userId: string, desc: string) {
    return await prisma.usuario.update({
      where: { id: userId },
      data: { desc }
    })
  },

  async updateProfileImage(userId: string, imageUrl: string | null) {
    return await prisma.usuario.update({
      where: { id: userId },
      data: { image: imageUrl }
    })
  }
}
