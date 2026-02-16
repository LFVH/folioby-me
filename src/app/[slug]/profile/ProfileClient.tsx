'use client';

import { useState, useEffect } from 'react';
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Cabeçalho com imagem de capa (opcional) */}
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
        
        {/* Área do perfil */}
        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="flex justify-between items-start -mt-12 mb-4">
            <div className="relative">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name}
                  width={96}
                  height={96}
                  className="rounded-full border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gray-200 flex items-center justify-center">
                  <span className="text-2xl text-gray-500">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            
            {/* Botão de editar (só aparece se for o próprio usuário) */}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="mt-12 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {isEditing ? 'Cancelar' : 'Editar perfil'}
            </button>
          </div>

          {/* Nome do usuário */}
          <h1 className="text-2xl font-bold mb-4">{user.name}</h1>

          {/* Seção de descrição */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Sobre mim</h2>
            
            {isEditing ? (
              <div className="space-y-4">
                <TipTapEditor
                  content={desc}
                  onChange={setDesc}
                  editable={true}
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setDesc(user.desc);
                      setIsEditing(false);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={isSaving}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={isSaving}
                  >
                    {isSaving ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="prose max-w-none">
                {desc && Object.keys(desc).length > 0 ? (
                  <TipTapEditor
                    content={desc}
                    onChange={() => {}}
                    editable={false}
                  />
                ) : (
                  <p className="text-gray-500 italic">
                    Este usuário ainda não adicionou uma descrição.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}