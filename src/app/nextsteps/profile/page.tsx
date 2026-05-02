// app/profile/page.tsx
'use client'

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify';
import FeatureNoticePopup from '@/components/FeatureNoticePopup';
import { contact_mail } from '@/types';
import { getUserSlugValidationError, normalizeUserSlug } from '@/lib/user-slug';

export default function UserPage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [slug, setSlug] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [userImage, setUserImage] = useState<string | null>(null)

  useEffect(() => {
    
    if (session?.user) {
    console.log(session.user.image)
      setSlug(session.user.slug || '')
      setUserImage(session.user.image || null)
    }
  }, [session])
  const slugError = slug ? getUserSlugValidationError(slug) : null

  const handleUpdateSlug = async () => {
    const currentSlugError = getUserSlugValidationError(slug)

    if (currentSlugError) {
      toast.error(currentSlugError)
      return
    }

    const normalizedSlug = normalizeUserSlug(slug)

    setIsLoading(true)
    try {
      const response = await fetch('/api/nextsteps/user/slug', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slug: normalizedSlug }),
      })

      const data = await response.json()

      if (response.ok) {
        setSlug(normalizedSlug)
        await update({ slug: normalizedSlug })
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

 const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Validação de tipo
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    toast.error('Tipo de arquivo não suportado. Use JPEG, PNG ou WebP');
    return;
  }

  // Validação de tamanho (5MB)
  if (file.size > 5 * 1024 * 1024) {
    toast.error('Arquivo muito grande (máx. 5MB)');
    return;
  }

  setUploadingImage(true);
  const formData = new FormData();
  formData.append('file', file);

  try {
    // 1. Upload da imagem (POST)
    const uploadResponse = await fetch('/api/nextsteps/user/image', {
      method: 'POST',
      body: formData,
    });

    const uploadData = await uploadResponse.json();

    if (!uploadResponse.ok) {
      throw new Error(uploadData.error || 'Erro ao fazer upload');
    }

    // 2. Atualizar perfil com a nova URL (PUT)
    const updateResponse = await fetch('/api/nextsteps/user/image', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        imageUrl: uploadData.url,
        oldImageUrl: userImage // Passa a imagem antiga para deletar
      }),
    });

    const updateData = await updateResponse.json();

    if (updateResponse.ok) {
      await update({ image: uploadData.url });
      setUserImage(uploadData.url);
      toast.success('Foto de perfil atualizada!');
    } else {
      throw new Error(updateData.error || 'Erro ao atualizar perfil');
    }

  } catch (error) {
    console.error('Erro no upload:', error);
    toast.error(error instanceof Error ? error.message : 'Erro ao fazer upload');
  } finally {
    setUploadingImage(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }
};

const handleRemoveImage = async () => {
  if (!userImage) return;
  
  setIsLoading(true);
  try {
    const response = await fetch(
      `/api/nextsteps/user/image?url=${encodeURIComponent(userImage)}`,
      {
        method: 'DELETE',
      }
    );

    const data = await response.json();

    if (response.ok) {
      await update({ image: null });
      setUserImage(null);
      toast.success('Foto de perfil removida!');
    } else {
      throw new Error(data.error || 'Erro ao remover foto');
    }
  } catch (error) {
    console.error('Erro ao remover:', error);
    toast.error(error instanceof Error ? error.message : 'Erro ao remover foto');
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-10">Manage Profile</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Coluna 1: Informações do usuário */}
            <div className="space-y-8">
              {/* Seção de Foto de Perfil */}
              <div className="bg-[#141414] p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4">Profile Photo (/slug/profile)</h2>
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-800">
                      {userImage ? (
                        <Image
                          src={userImage}
                          alt={session?.user?.name ?? "user"}
                          fill
                          className="object-cover object-top"
                          priority
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
                  
                  <div className="space-y-4">
                    {/* Instruções em destaque */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                        Recomendations:
                      </h4>
                      
                      <ul className="space-y-2 text-sm text-zinc-400">
                        <li className="flex items-start gap-2">
                          <span className="text-red-600 text-lg leading-5">•</span>
                          <span><strong className="text-zinc-300">Format 3:4</strong> (ex: 1200×1600px, 600×800px)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-600 text-lg leading-5">•</span>
                          <span><strong className="text-zinc-300">Max Size:</strong> 5MB</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-600 text-lg leading-5">•</span>
                          <span><strong className="text-zinc-300">Accepted formats:</strong> JPG, PNG, WebP</span>
                        </li>
                        <li className="flex items-start gap-2 text-xs border-t border-zinc-800 pt-2 mt-1">
                          <span className="text-red-600">💡</span>
                          <span>Images may be adjusted</span>
                        </li>
                      </ul>
                    </div>

                    {/* Botões existentes */}
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
                        className="px-4 py-2 bg-white text-black font-semibold rounded hover:bg-gray-200 transition disabled:opacity-50 w-full sm:w-auto"
                      >
                        {uploadingImage ? 'Enviando...' : 'Alterar Foto'}
                      </button>
                      {userImage && (
                        <button
                          onClick={handleRemoveImage}
                          disabled={isLoading}
                          className="px-4 py-2 bg-red-600 text-white font-semibold rounded hover:bg-red-700 transition disabled:opacity-50 w-full sm:w-auto"
                        >
                          Remover Foto
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção de Slug */}
              <div className="bg-[#141414] p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4">Profile's Slug</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Your unique identifier
                    </label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase())}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded focus:outline-none focus:border-red-600"
                      placeholder="seu-slug-aqui"
                    />
                    <p className={`text-sm mt-2 ${slugError ? 'text-red-500' : 'text-gray-500'}`}>
                      {slugError ?? 'Use only lowercase letters, numbers and hyphens (max. 50 characters) /name-surname'}
                    </p>
                  </div>
                  <button
                    onClick={handleUpdateSlug}
                    disabled={isLoading || !slug || !!slugError}
                    className="px-6 py-3 bg-red-600 text-white font-semibold rounded hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : 'Update Slug'}
                  </button>
                </div>
              </div>
            </div>

            {/* Coluna 2: Segurança e Assinatura */}
            <div className="space-y-8">
              {/* Seção de Alterar Senha */}
              <div className="bg-[#141414] p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4">Change Password</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      New Password
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
                      Confirm new password
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
                    {isLoading ? 'Saving...' : 'Alterar Senha'}
                  </button>
                </div>
              </div>

              {/* Seção de Assinatura */}
              <div className="bg-[#141414] p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4">Signature</h2>
                <div className="space-y-4">
                  <p className="text-gray-400">
                    Manage your signature
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <FeatureNoticePopup email={contact_mail} triggerText="Manage Subscription" />
                  </div>
                </div>
              </div>
              
              {/* Informações do Usuário */}
              <div className="bg-[#141414] p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4">Account info</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400">Name</p>
                    <p className="text-lg">{session?.user?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="text-lg">{session?.user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Slug</p>
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
