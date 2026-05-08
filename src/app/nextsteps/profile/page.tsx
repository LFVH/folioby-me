'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import FeatureNoticePopup from '@/components/FeatureNoticePopup'
import { ProfileImageCropper } from '@/components/nextsteps/profile/ProfileImageCropper'
import { Avatar } from '@/components/ui/Avatar'
import { getUserSlugValidationError, normalizeUserSlug } from '@/lib/user-slug'
import { contact_mail } from '@/types'

type ImageMimeType = 'image/jpeg' | 'image/png'

interface PendingImageCrop {
  src: string
  name: string
  outputFormat: ImageMimeType
}

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
  const [pendingImageCrop, setPendingImageCrop] = useState<PendingImageCrop | null>(null)

  useEffect(() => {
    if (session?.user) {
      setSlug(session.user.slug || '')
      setUserImage(session.user.image || null)
    }
  }, [session])

  useEffect(() => {
    return () => {
      if (pendingImageCrop?.src) {
        URL.revokeObjectURL(pendingImageCrop.src)
      }
    }
  }, [pendingImageCrop])

  const slugError = slug ? getUserSlugValidationError(slug) : null

  const resetPendingImageCrop = () => {
    setPendingImageCrop((current) => {
      if (current?.src) {
        URL.revokeObjectURL(current.src)
      }

      return null
    })
  }

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
    } catch {
      toast.error('Erro ao atualizar slug')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (password !== confirmPassword) {
      toast.error('As senhas nao coincidem')
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
    } catch {
      toast.error('Erro ao atualizar senha')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error('Tipo de arquivo nao suportado. Use JPEG, PNG ou WebP')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande (max. 5MB)')
      return
    }

    const previewUrl = URL.createObjectURL(file)
    const outputFormat: ImageMimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg'

    setPendingImageCrop((current) => {
      if (current?.src) {
        URL.revokeObjectURL(current.src)
      }

      return {
        src: previewUrl,
        name: file.name,
        outputFormat,
      }
    })

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleCroppedImageUpload = async (file: File) => {
    setUploadingImage(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const uploadResponse = await fetch('/api/nextsteps/user/image', {
        method: 'POST',
        body: formData,
      })

      const uploadData = await uploadResponse.json()

      if (!uploadResponse.ok) {
        throw new Error(uploadData.error || 'Erro ao fazer upload')
      }

      const updateResponse = await fetch('/api/nextsteps/user/image', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: uploadData.url,
          oldImageUrl: userImage,
        }),
      })

      const updateData = await updateResponse.json()

      if (!updateResponse.ok) {
        throw new Error(updateData.error || 'Erro ao atualizar perfil')
      }

      await update({ image: uploadData.url })
      setUserImage(uploadData.url)
      resetPendingImageCrop()
      toast.success('Foto de perfil atualizada!')
    } catch (error) {
      console.error('Erro no upload:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao fazer upload')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleRemoveImage = async () => {
    if (!userImage) return

    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/nextsteps/user/image?url=${encodeURIComponent(userImage)}`,
        {
          method: 'DELETE',
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao remover foto')
      }

      await update({ image: null })
      setUserImage(null)
      toast.success('Foto de perfil removida!')
    } catch (error) {
      console.error('Erro ao remover:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao remover foto')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="px-4 pb-16 pt-32">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-10 text-4xl font-bold">Manage Profile</h1>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="space-y-8">
              <div className="rounded-lg bg-[#141414] p-6">
                <h2 className="mb-4 text-2xl font-semibold">Profile Content</h2>
                <p className="mb-4 text-gray-400">
                  Edite a descricao e os links do seu perfil publico.
                </p>
                <Link
                  href="/nextsteps/user/profile"
                  className="inline-flex items-center rounded bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700"
                >
                  Abrir editor do perfil
                </Link>
              </div>

              <div className="rounded-lg bg-[#141414] p-6">
                <h2 className="mb-4 text-2xl font-semibold">Profile Photo (/slug/profile)</h2>
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                  <div className="relative">
                    <Avatar
                      src={userImage}
                      name={session?.user?.name}
                      priority
                      sizes="128px"
                      className="h-32 w-32 border border-white/10 bg-gray-800"
                      fallbackClassName="text-4xl"
                    />
                    {uploadingImage && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/55">
                        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-white" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                      <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                        New crop experience:
                      </h4>

                      <ul className="space-y-2 text-sm text-zinc-400">
                        <li className="flex items-start gap-2">
                          <span className="text-lg leading-5 text-red-600">*</span>
                          <span>
                            <strong className="text-zinc-300">Circular crop</strong> com preview em tempo real, igual a apps de mensagem e social
                          </span>
                        </li>

                        <li className="flex items-start gap-2">
                          <span className="text-lg leading-5 text-red-600">*</span>
                          <span>
                            <strong className="text-zinc-300">Arraste e de zoom</strong> com mouse, scroll, touch e pinca
                          </span>
                        </li>

                        <li className="flex items-start gap-2">
                          <span className="text-lg leading-5 text-red-600">*</span>
                          <span>
                            <strong className="text-zinc-300">Export high quality:</strong> JPG ou PNG prontos para avatar
                          </span>
                        </li>

                        <li className="flex items-start gap-2">
                          <span className="text-lg leading-5 text-red-600">*</span>
                          <span>
                            <strong className="text-zinc-300">Accepted formats:</strong> JPG, PNG, WebP ate 5MB
                          </span>
                        </li>

                        <li className="mt-1 flex items-start gap-2 border-t border-zinc-800 pt-2 text-xs">
                          <span className="text-red-600">i</span>
                          <span>
                            O recorte salvo passa a ser o mesmo usado no botao do usuario e no perfil publico.
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageSelection}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="w-full rounded bg-white px-4 py-2 font-semibold text-black transition hover:bg-gray-200 disabled:opacity-50 sm:w-auto"
                      >
                        {uploadingImage ? 'Enviando...' : 'Escolher Nova Foto'}
                      </button>
                      {userImage && (
                        <button
                          onClick={handleRemoveImage}
                          disabled={isLoading}
                          className="w-full rounded bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700 disabled:opacity-50 sm:w-auto"
                        >
                          Remover Foto
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-[#141414] p-6">
                <h2 className="mb-4 text-2xl font-semibold">Profile&apos;s Slug</h2>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm text-gray-400">
                      Seu identificador unico, publico e facilmente compartilhavel.
                    </label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(event) => setSlug(event.target.value.toLowerCase())}
                      className="w-full rounded border border-gray-700 bg-gray-900 px-4 py-3 focus:border-red-600 focus:outline-none"
                      placeholder="seu-slug-aqui"
                    />
                    <p className={`mt-2 text-sm ${slugError ? 'text-red-500' : 'text-gray-500'}`}>
                      {slugError ?? 'Use only lowercase letters, numbers and hyphens (max. 50 characters) /name-surname'}
                    </p>
                  </div>
                  <button
                    onClick={handleUpdateSlug}
                    disabled={isLoading || !slug || !!slugError}
                    className="rounded bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : 'Update Slug'}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="rounded-lg bg-[#141414] p-6">
                <h2 className="mb-4 text-2xl font-semibold">Change Password</h2>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm text-gray-400">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="w-full rounded border border-gray-700 bg-gray-900 px-4 py-3 focus:border-red-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-gray-400">
                      Confirm new password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      className="w-full rounded border border-gray-700 bg-gray-900 px-4 py-3 focus:border-red-600 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={handleUpdatePassword}
                    disabled={isLoading || password !== confirmPassword || password.length < 6}
                    className="rounded bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : 'Alterar Senha'}
                  </button>
                </div>
              </div>

              <div className="rounded-lg bg-[#141414] p-6">
                <h2 className="mb-4 text-2xl font-semibold">Signature</h2>
                <div className="space-y-4">
                  <p className="text-gray-400">
                    Manage your signature
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <FeatureNoticePopup email={contact_mail} triggerText="Manage Subscription" />
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-[#141414] p-6">
                <h2 className="mb-4 text-2xl font-semibold">Account info</h2>
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
                    <p className="text-lg">{session?.user?.slug || 'Nao definido'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Para editar essa sessao ou deletar conta envie email para</p>
                    <p className="text-sm text-gray-400">{contact_mail}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <ProfileImageCropper
        isOpen={!!pendingImageCrop}
        imageSrc={pendingImageCrop?.src ?? null}
        fileName={pendingImageCrop?.name ?? 'avatar'}
        outputFormat={pendingImageCrop?.outputFormat ?? 'image/jpeg'}
        onClose={resetPendingImageCrop}
        onConfirm={handleCroppedImageUpload}
      />
    </div>
  )
}
