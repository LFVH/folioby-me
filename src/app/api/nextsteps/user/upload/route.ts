// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { verifyUser } from '@/utils/verifyUserAuth'

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyUser();
    if (authResult instanceof NextResponse) return authResult;
    const { userId, isPremium } = authResult;

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    // Validar tipo de arquivo
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de arquivo não suportado' }, { status: 400 })
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Arquivo muito grande (máx. 5MB)' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Gerar nome único para o arquivo
    const filename = `${uuidv4()}${path.extname(file.name)}`
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'profiles')
    
    // Em produção, você deve usar um serviço como S3, Cloudinary, etc.
    // Aqui está um exemplo básico com filesystem
    await writeFile(path.join(uploadDir, filename), buffer)
    
    const imageUrl = `/uploads/profiles/${filename}`
    
    return NextResponse.json({ url: imageUrl })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Erro ao fazer upload' }, { status: 500 })
  }
}