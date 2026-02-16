// app/services/userService.ts
import prisma from '@/prisma'
import bcrypt from 'bcryptjs'

export const userService = {
  async updatePassword(userId: string, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    
    return await prisma.usuario.update({
      where: { id: userId },
      data: { password: hashedPassword }
    })
  },

  async updateSlug(userId: string, slug: string) {
    // Validação do slug
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    if (!slugRegex.test(slug)) {
      throw new Error('Slug inválido. Use apenas letras minúsculas, números e hífens')
    }
        const findSlugDB = await prisma.usuario.findUnique({
      where: { slug: slug}
    })

    if (findSlugDB) {throw new Error('Slug já utilizada') }
    return await prisma.usuario.update({
      where: { id: userId },
      data: { slug }
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