'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { handleImgError } from '@/utils/imageFallback'
import { useRouter } from 'next/navigation'
import { BlobService } from '@/lib/blob-service'
import { extractFonteFromUrl, normalizeExternalUrl } from '@/lib/profile-links'
import { upload } from '@vercel/blob/client'

interface Categoria {
  id: number
  nome: string | null
  name: string | null
}

interface ConteudoFormProps {
  conteudo?: any
  categorias: Categoria[]
}

interface FormData {
  name: string
  fonte: string
  link: string
  linkext: string
  file: File | null
  files: File[]
  isSequence: boolean
}

const GENERIC_SAVE_ERROR =
  'Nao foi possivel salvar o conteudo agora. Se o problema continuar, entre em contato com o dev.'

const getFriendlyErrorMessage = (status?: number, apiMessage?: string) => {
  if (apiMessage) return apiMessage
  if (status && status >= 500) return GENERIC_SAVE_ERROR

  return 'Revise os dados do conteudo e tente novamente.'
}

export default function ConteudoForm({ conteudo, categorias }: ConteudoFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [selectedCategorias, setSelectedCategorias] = useState<number[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>({
    name: conteudo?.name || '',
    fonte: conteudo?.fonte || '',
    link: conteudo?.link || '',
    linkext: conteudo?.linkext || '',
    file: null,
    files: [],
    isSequence: false,
  })

  useEffect(() => {
    if (conteudo?.categorias) {
      setSelectedCategorias(
        conteudo.categorias
          .map((categoria: any) => Number(categoria.id))
          .filter((categoriaId: number) => Number.isInteger(categoriaId) && categoriaId > 0)
      )
    }
  }, [conteudo])

  useEffect(() => {
    const urls: string[] = []

    if (formData.isSequence) {
      formData.files.forEach((file) => {
        urls.push(URL.createObjectURL(file))
      })
    } else if (formData.file) {
      urls.push(URL.createObjectURL(formData.file))
    } else if (conteudo?.mediaUrls?.length > 0) {
      urls.push(...conteudo.mediaUrls)
    } else if (conteudo?.link) {
      urls.push(conteudo.link)
    }

    setPreviewUrls(urls)

    return () => {
      urls.forEach((url) => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url)
        }
      })
    }
  }, [formData.file, formData.files, formData.isSequence, conteudo])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) return

    const validation = BlobService.validateImage(file)
    if (!validation.valid) {
      setErrorMessage(validation.error || GENERIC_SAVE_ERROR)
      return
    }

    setErrorMessage(null)
    setFormData((prev) => ({
      ...prev,
      file,
      files: [],
      isSequence: false,
    }))
  }

  const handleMultipleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    for (const file of files) {
      const validation = BlobService.validateImage(file)
      if (!validation.valid) {
        setErrorMessage(`Arquivo ${file.name}: ${validation.error}`)
        return
      }
    }

    setErrorMessage(null)
    setFormData((prev) => ({
      ...prev,
      files,
      file: null,
      isSequence: true,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedCategorias.length === 0) {
      setErrorMessage('Selecione pelo menos uma categoria antes de salvar.')
      return
    }

    setLoading(true)
    setErrorMessage(null)

    try {
      let uploadedUrls: string[] = []
      const totalUploadBytes = formData.isSequence
        ? formData.files.reduce((sum, file) => sum + file.size, 0)
        : formData.file
          ? formData.file.size
          : 0

      if (formData.isSequence && formData.files.length > 0) {
        const uploads = await Promise.all(
          formData.files.map(async (file) => {
            const uniqueName = BlobService.buildShortUniquePath('nextsteps/sequences', file.name)
            const blob = await upload(uniqueName, file, {
              access: 'public',
              handleUploadUrl: '/api/nextsteps/blob/upload',
              clientPayload: JSON.stringify({ storageBytes: file.size }),
            })

            return blob.url
          })
        )

        uploadedUrls = uploads
      } else if (formData.file) {
        const uniqueName = BlobService.buildShortUniquePath('nextsteps', formData.file.name)
        const blob = await upload(uniqueName, formData.file, {
          access: 'public',
          handleUploadUrl: '/api/nextsteps/blob/upload',
          clientPayload: JSON.stringify({ storageBytes: formData.file.size }),
        })

        uploadedUrls = [blob.url]
      }

      const payload = {
        name: formData.name,
        fonte: formData.fonte,
        link: uploadedUrls[0] || formData.link || '',
        mediaUrls: uploadedUrls,
        linkext: formData.linkext,
        categoriasIds: selectedCategorias,
        isSequence: formData.isSequence,
        storageBytes: totalUploadBytes,
      }

      const url = conteudo
        ? `/api/nextsteps/conteudo/${conteudo.id}`
        : '/api/nextsteps/conteudo'

      const method = conteudo ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const isJsonResponse = response.headers.get('content-type')?.includes('application/json')
      const result = isJsonResponse ? await response.json() : null

      if (!response.ok || !result?.success) {
        setErrorMessage(getFriendlyErrorMessage(response.status, result?.error))
        return
      }

      router.push('/nextsteps/contents')
      router.refresh()
    } catch (error) {
      console.error(error)
      setErrorMessage(GENERIC_SAVE_ERROR)
    } finally {
      setLoading(false)
    }
  }

  const extractAndSetFonteFromUrl = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      fonte: extractFonteFromUrl(url),
    }))
  }

  const isMissingRequiredMedia = !conteudo && !formData.file && !formData.files.length
  const isSubmitDisabled =
    loading || isMissingRequiredMedia || selectedCategorias.length === 0

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {errorMessage && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {errorMessage}
          </div>
        )}

        <div>
          <label className="block text-white font-semibold mb-2">
            Nome do Conteudo *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
            required
          />
        </div>

        <div>
          <label className="block text-white font-semibold mb-2">
            Link para Redirecionamento *
          </label>
          <input
            type="url"
            value={formData.linkext}
            onChange={(e) => {
              const newUrl = e.target.value
              setFormData((prev) => ({ ...prev, linkext: newUrl }))
              extractAndSetFonteFromUrl(newUrl)
            }}
            onBlur={(e) => {
              const fixedUrl = normalizeExternalUrl(e.target.value)
              setFormData((prev) => ({
                ...prev,
                linkext: fixedUrl,
              }))
            }}
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
            placeholder="https://fonte.com/..."
            required
          />
        </div>

        <div>
          <label className="block text-white font-semibold mb-2">
            Fonte
          </label>
          <input
            type="text"
            value={formData.fonte}
            onChange={(e) => setFormData((prev) => ({ ...prev, fonte: e.target.value }))}
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
            placeholder="Ex: Instagram, YouTube, Vimeo"
          />
        </div>

        <div className="border-b border-gray-700">
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, isSequence: false }))}
              className={`py-2 px-4 font-medium ${
                !formData.isSequence
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400'
              }`}
            >
              GIF / Imagem Unica
            </button>
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, isSequence: true }))}
              className={`py-2 px-4 font-medium ${
                formData.isSequence
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400'
              }`}
            >
              Sequencia de Imagens
            </button>
          </div>
        </div>

        {!formData.isSequence && (
          <div>
            <label className="block text-white font-semibold mb-2">
              {formData.file || !conteudo ? 'Arquivo *' : 'Novo Arquivo (opcional)'}
            </label>
            <input
              type="file"
              accept=".gif,.jpg,.jpeg,.png,.webp,.avif,image/*"
              onChange={handleFileChange}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
            />
            <p className="text-gray-400 text-sm mt-1">
              GIF, JPEG, PNG, WebP ou AVIF (ate 500MB)
            </p>
          </div>
        )}

        {formData.isSequence && (
          <div>
            <label className="block text-white font-semibold mb-2">
              Imagens da Sequencia *
            </label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.avif,image/*"
              onChange={handleMultipleFilesChange}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
              multiple
            />
            <p className="text-gray-400 text-sm mt-1">
              Selecione varias imagens (JPEG, PNG, WebP, AVIF)
            </p>
            {formData.files.length > 0 && (
              <p className="text-blue-400 text-sm mt-1">
                {formData.files.length} imagem(ns) selecionada(s)
              </p>
            )}
          </div>
        )}

        {previewUrls.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-3">
              {formData.isSequence ? 'Preview da Sequencia:' : 'Preview:'}
            </h3>
            <div className={formData.isSequence ? 'grid grid-cols-4 gap-2' : ''}>
              {previewUrls.map((url, index) => (
                <div key={index} className="relative">
                  <Image
                    src={url}
                    alt={`Preview ${index + 1}`}
                    width={formData.isSequence ? 200 : 320}
                    height={formData.isSequence ? 96 : 192}
                    className={
                      formData.isSequence
                        ? 'w-full h-24 object-cover rounded border border-gray-600'
                        : 'max-w-xs max-h-48 rounded-lg border border-gray-600'
                    }
                    unoptimized
                    onError={(e) => handleImgError(e)}
                  />
                  {formData.isSequence && (
                    <span className="absolute top-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1.5 py-0.5 rounded">
                      {index + 1}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-white font-semibold mb-2">
            Categorias *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-gray-800 p-4 rounded-lg">
            {categorias.map((categoria) => (
              <label key={categoria.id} className="flex items-center space-x-2 text-white">
                <input
                  type="checkbox"
                  value={categoria.id}
                  checked={selectedCategorias.includes(categoria.id)}
                  onChange={(e) => {
                    setErrorMessage(null)

                    if (e.target.checked) {
                      setSelectedCategorias((prev) => [...prev, categoria.id])
                      return
                    }

                    setSelectedCategorias((prev) => prev.filter((item) => item !== categoria.id))
                  }}
                  className="rounded bg-gray-700 border-gray-600"
                />
                <span>{categoria.name || categoria.nome || `Categoria ${categoria.id}`}</span>
              </label>
            ))}
          </div>
          {selectedCategorias.length === 0 && (
            <p className="mt-2 text-sm text-amber-300">
              Escolha pelo menos uma categoria para cadastrar ou atualizar o conteudo.
            </p>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : conteudo ? 'Atualizar' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  )
}
