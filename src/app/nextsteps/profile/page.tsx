// app/profile/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import ManageSubscriptionButton from '@/components/letsgo/ManageSubscriptionButton'
import { toast } from 'react-toastify';

export default function UserPage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Estados para o formulário
  const [slug, setSlug] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [userImage, setUserImage] = useState<string | null>(null)

  // Inicializar com dados do usuário
  useEffect(() => {
    if (session?.user) {
      setSlug(session.user.slug || '')
      setUserImage(session.user.image || null)
    }
  }, [session])

  // Função para validar slug
  const validateSlug = (slug: string) => {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    return slugRegex.test(slug)
  }

  // Função para atualizar slug
  const handleUpdateSlug = async () => {
    if (!validateSlug(slug)) {
      toast.error('Slug inválido. Use apenas letras minúsculas, números e hífens')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/nextsteps/user/slug', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slug }),
      })

      const data = await response.json()

      if (response.ok) {
        await update({ slug })
        toast.success('Slug atualizado com sucesso!')
        router.refresh()
      } else {
        toast.error(data.error || 'Erro ao atualizar slug')
      }
    } catch (error) {
      toast.error('Erro ao atualizar slug')
    } finally {
      setIsLoading(false)
    }
  }

  // Função para atualizar senha
  const handleUpdatePassword = async () => {
    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem')
      return
    }

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/nextsteps/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Senha atualizada com sucesso!')
        setPassword('')
        setConfirmPassword('')
      } else {
        toast.error(data.error || 'Erro ao atualizar senha')
      }
    } catch (error) {
      toast.error('Erro ao atualizar senha')
    } finally {
      setIsLoading(false)
    }
  }

  // Função para upload de imagem
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error('Tipo de arquivo não suportado. Use JPEG, PNG ou WebP')
      return
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande (máx. 5MB)')
      return
    }

    setUploadingImage(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/nextsteps/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        // Atualizar a imagem no perfil do usuário
        const updateResponse = await fetch('/api/nextsteps/user/image', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageUrl: data.url }),
        })

        if (updateResponse.ok) {
          await update({ image: data.url })
          setUserImage(data.url)
          toast.success('Foto de perfil atualizada!')
        }
      } else {
        toast.error(data.error || 'Erro ao fazer upload')
      }
    } catch (error) {
      toast.error('Erro ao fazer upload')
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Função para remover imagem
  const handleRemoveImage = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/user/image', {
        method: 'DELETE',
      })

      if (response.ok) {
        await update({ image: null })
        setUserImage(null)
        toast.success('Foto de perfil removida!')
      }
    } catch (error) {
      toast.error('Erro ao remover foto')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">

      <main className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-10">Gerenciar Perfil</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Coluna 1: Informações do usuário */}
            <div className="space-y-8">
              {/* Seção de Foto de Perfil */}
              <div className="bg-[#141414] p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4">Foto de Perfil</h2>
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-800">
                      {userImage ? (
                        <img 
                          src={userImage} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-4xl font-bold">
                            {session?.user?.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="px-4 py-2 bg-white text-black font-semibold rounded hover:bg-gray-200 transition disabled:opacity-50"
                    >
                      {uploadingImage ? 'Enviando...' : 'Alterar Foto'}
                    </button>
                    {userImage && (
                      <button
                        onClick={handleRemoveImage}
                        disabled={isLoading}
                        className="px-4 py-2 bg-red-600 text-white font-semibold rounded hover:bg-red-700 transition disabled:opacity-50"
                      >
                        Remover Foto
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Seção de Slug */}
              <div className="bg-[#141414] p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4">Slug do Perfil</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Seu identificador único
                    </label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded focus:outline-none focus:border-red-600"
                      placeholder="seu-slug-aqui"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Use apenas letras minúsculas, números e hífens
                    </p>
                  </div>
                  <button
                    onClick={handleUpdateSlug}
                    disabled={isLoading || !validateSlug(slug)}
                    className="px-6 py-3 bg-red-600 text-white font-semibold rounded hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {isLoading ? 'Salvando...' : 'Atualizar Slug'}
                  </button>
                </div>
              </div>
            </div>

            {/* Coluna 2: Segurança e Assinatura */}
            <div className="space-y-8">
              {/* Seção de Alterar Senha */}
              <div className="bg-[#141414] p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4">Alterar Senha</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Nova Senha
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded focus:outline-none focus:border-red-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Confirmar Nova Senha
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded focus:outline-none focus:border-red-600"
                    />
                  </div>
                  <button
                    onClick={handleUpdatePassword}
                    disabled={isLoading || password !== confirmPassword || password.length < 6}
                    className="px-6 py-3 bg-red-600 text-white font-semibold rounded hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {isLoading ? 'Salvando...' : 'Alterar Senha'}
                  </button>
                </div>
              </div>

              {/* Seção de Assinatura */}
              <div className="bg-[#141414] p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4">Assinatura</h2>
                <div className="space-y-4">
                  <p className="text-gray-400">
                    Gerencie sua assinatura e veja os detalhes do seu plano atual.
                  </p>
                  <div className="pt-4">
                    <ManageSubscriptionButton />
                  </div>
                </div>
              </div>

              {/* Informações do Usuário */}
              <div className="bg-[#141414] p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4">Informações da Conta</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400">Nome</p>
                    <p className="text-lg">{session?.user?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="text-lg">{session?.user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Slug Atual</p>
                    <p className="text-lg">{session?.user?.slug || 'Não definido'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}