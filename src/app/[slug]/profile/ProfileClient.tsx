'use client';

import { useState } from 'react';
import Image from 'next/image';
import TipTapEditor from '@/components/TipTapEditor';

interface User {
  name: string;
  image: string | null;
  desc: any;
}

interface ProfileClientProps {
  user: User;
  slug: string;
}

export default function ProfileClient({ user, slug }: ProfileClientProps) {
  const [desc, setDesc] = useState(user.desc);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/nextsteps/user/desc`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ desc }),
      });

      if (response.ok) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Cabeçalho com "PORTFOLIO" */}
        <div className="mb-16 border-b border-red-600 pb-4">
          <h1 className="text-4xl font-light tracking-[0.3em] text-white">
            PORTFOLIO
          </h1>
          <div className="h-1 w-24 bg-red-600 mt-2"></div>
        </div>

        {/* Conteúdo principal - Layout de currículo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Coluna da esquerda - Informações e descrição */}
          <div className="space-y-8">
            {/* Nome em destaque */}
            <div>
              <h2 className="text-5xl font-bold text-white mb-2">
                {user.name}
              </h2>
              <div className="h-0.5 w-32 bg-red-600"></div>
            </div>

            {/* Seção de descrição/currículo */}
            <div className="space-y-6">
              {isEditing ? (
                <div className="space-y-4">
                  <TipTapEditor
                    content={desc}
                    onChange={setDesc}
                    editable={true}
                  />
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={() => {
                        setDesc(user.desc);
                        setIsEditing(false);
                      }}
                      className="px-6 py-2 border border-red-600 text-white hover:bg-red-600/20 transition-colors rounded-sm font-medium"
                      disabled={isSaving}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-6 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors rounded-sm font-medium disabled:opacity-50"
                      disabled={isSaving}
                    >
                      {isSaving ? 'Salvando...' : 'Salvar'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="prose prose-invert max-w-none">
                  {desc && Object.keys(desc).length > 0 ? (
                    <div className="text-gray-300 leading-relaxed">
                      <TipTapEditor
                        content={desc}
                        onChange={() => {}}
                        editable={false}
                      />
                    </div>
                  ) : (
                    <p className="text-gray-500 italic border-l-4 border-red-600 pl-4">
                      Este usuário ainda não adicionou uma descrição.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Botão de editar (aparece como link discreto) */}
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm text-red-600 hover:text-red-500 transition-colors font-medium flex items-center gap-2 group"
              >
                <span className="w-5 h-px bg-red-600 group-hover:w-8 transition-all"></span>
                EDITAR PERFIL
              </button>
            )}
          </div>

          {/* Coluna da direita - Imagem em destaque */}
          <div className="relative lg:sticky lg:top-24">
            <div className="relative aspect-[3/4] w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
              {/* Efeito de borda vermelha */}
              <div className="absolute -inset-1 bg-gradient-to-t from-red-600 to-transparent opacity-50 blur-sm"></div>
              
              {/* Container da imagem */}
              <div className="relative h-full w-full overflow-hidden border-2 border-red-600/30">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="h-full w-full bg-zinc-900 flex items-center justify-center">
                    <span className="text-8xl text-red-600/30 font-light">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Detalhe decorativo */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 border-b-2 border-r-2 border-red-600"></div>
              <div className="absolute -top-4 -left-4 w-24 h-24 border-t-2 border-l-2 border-red-600"></div>
            </div>
          </div>
        </div>

        {/* Rodapé sutil */}
        <div className="mt-24 pt-8 border-t border-zinc-800 text-center text-zinc-600 text-sm">
          <p>© {new Date().getFullYear()} • PORTFOLIO</p>
        </div>
      </div>
    </div>
  );
}