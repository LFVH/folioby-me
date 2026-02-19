'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BlobService } from '@/lib/blob-service'

interface Categoria {
  id: number
  nome: string
  name: string
}

interface ConteudoFormProps {
  conteudo?: any
  categorias: Categoria[]
}

interface FormData {
  name: string;
  fonte: string;
  link: string;
  linkext: string;
  file: File | null;
  files: File[];
  isSequence: boolean;
}

export default function ConteudoForm({ conteudo, categorias }: ConteudoFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [selectedCategorias, setSelectedCategorias] = useState<number[]>([])

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
      setSelectedCategorias(conteudo.categorias.map((c: any) => c.categoriaId));
    }
  }, [conteudo]);

  useEffect(() => {
    const urls: string[] = [];
    
    if (formData.isSequence) {
      formData.files.forEach(file => {
        urls.push(URL.createObjectURL(file));
      });
    } else if (formData.file) {
      urls.push(URL.createObjectURL(formData.file));
    } else if (conteudo?.mediaUrls?.length > 0) {
      urls.push(...conteudo.mediaUrls);
    } else if (conteudo?.link) {
      urls.push(conteudo.link);
    }
    
    setPreviewUrls(urls);
    
    return () => {
      urls.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [formData.file, formData.files, formData.isSequence, conteudo]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = BlobService.validateImage(file);
      if (!validation.valid) {
        alert(validation.error);
        return;
      }
      
      setFormData(prev => ({ 
        ...prev, 
        file, 
        files: [],
        isSequence: false 
      }));
    }
  };

  const handleMultipleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    for (const file of files) {
      const validation = BlobService.validateImage(file);
      if (!validation.valid) {
        alert(`Arquivo ${file.name}: ${validation.error}`);
        return;
      }
    }
    
    setFormData(prev => ({ 
      ...prev, 
      files, 
      file: null,
      isSequence: true 
    }));
  };

  const handleCategoriaToggle = (categoriaId: number) => {
    setSelectedCategorias(prev =>
      prev.includes(categoriaId)
        ? prev.filter(id => id !== categoriaId)
        : [...prev, categoriaId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('fonte', formData.fonte);
      submitData.append('link', formData.link);
      submitData.append('linkext', formData.linkext);
      submitData.append('categoriasIds', selectedCategorias.join(','));
      
      if (formData.isSequence) {
        submitData.append('isSequence', 'true');
        formData.files.forEach(file => {
          submitData.append('files', file);
        });
      } else if (formData.file) {
        submitData.append('file', formData.file);
      }

      const url = conteudo 
        ? `/api/nextsteps/conteudo/${conteudo.id}`
        : '/api/nextsteps/conteudo';

      const method = conteudo ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: submitData
      });

      const result = await response.json();

      if (result.success) {
        router.push('/nextsteps/contents');
        router.refresh();
      } else {
        alert(result.error || 'Erro ao Save conteúdo');
      }
    } catch (error) {
      alert('Erro ao Save conteúdo');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="max-w-4xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nome */}
        <div>
          <label className="block text-white font-semibold mb-2">
            Nome do Conteúdo *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
            required
          />
        </div>
        {/* Fonte */}
        <div>
          <label className="block text-white font-semibold mb-2">
            Fonte
          </label>
          <input
            type="text"
            value={formData.fonte}
            onChange={(e) => setFormData(prev => ({ ...prev, fonte: e.target.value }))}
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
            placeholder="Ex: Instagram, YouTube, Vimeo"
          />
        </div>
        {/* Link Externo */}
        <div>
          <label className="block text-white font-semibold mb-2">
            Link para Redirecionamento *
          </label>
          <input
            type="url"
            value={formData.linkext}
            onChange={(e) => setFormData(prev => ({ ...prev, linkext: e.target.value }))}
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
            placeholder="https://..."
            required
          />
        </div>
        {/* Tabs para escolher tipo de upload */}
        <div className="border-b border-gray-700">
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, isSequence: false }))}
              className={`py-2 px-4 font-medium ${
                !formData.isSequence
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400'
              }`}
            >
              GIF / Imagem Única
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, isSequence: true }))}
              className={`py-2 px-4 font-medium ${
                formData.isSequence
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400'
              }`}
            >
              Sequência de Imagens
            </button>
          </div>
        </div>
        {/* Upload de arquivo único (GIF/Imagem) */}
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
              GIF, JPEG, PNG, WebP ou AVIF (até 500MB)
            </p>
          </div>
        )}
        {/* Upload de múltiplas imagens */}
        {formData.isSequence && (
          <div>
            <label className="block text-white font-semibold mb-2">
              Imagens da Sequência *
            </label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.avif,image/*"
              onChange={handleMultipleFilesChange}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
              multiple
            />
            <p className="text-gray-400 text-sm mt-1">
              Selecione várias imagens (JPEG, PNG, WebP, AVIF)
            </p>
            {formData.files.length > 0 && (
              <p className="text-blue-400 text-sm mt-1">
                {formData.files.length} imagem(ns) selecionada(s)
              </p>
            )}
          </div>
        )}
        {/* Preview das imagens */}
        {previewUrls.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-3">
              {formData.isSequence ? 'Preview da Sequência:' : 'Preview:'}
            </h3>
            <div className={formData.isSequence ? 'grid grid-cols-4 gap-2' : ''}>
              {previewUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className={formData.isSequence
                      ? 'w-full h-24 object-cover rounded border border-gray-600'
                      : 'max-w-xs max-h-48 rounded-lg border border-gray-600'
                    }
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
        {/* Categorias */}
        <div>
          <label className="block text-white font-semibold mb-2">
            Categorias
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-gray-800 p-4 rounded-lg">
            {categorias.map((categoria) => (
              <label key={categoria.id} className="flex items-center space-x-2 text-white">
                <input
                  type="checkbox"
                  value={categoria.id}
                  checked={selectedCategorias.includes(categoria.id)}
                  onChange={(e) => {
                    const id = categoria.id
                    if (e.target.checked) {
                      setSelectedCategorias([...selectedCategorias, id])
                    } else {
                      setSelectedCategorias(selectedCategorias.filter(c => c !== id))
                    }
                  }}
                  className="rounded bg-gray-700 border-gray-600"
                />
                <span>{categoria.name}</span>
              </label>
            ))}
          </div>
        </div>
        {/* Botões */}
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
            disabled={loading || (!formData.file && !formData.files.length && !conteudo)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : conteudo ? 'Update' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}