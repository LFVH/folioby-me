'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import TipTapEditor from '@/components/logged/TipTapEditor';
import LinksManager from '@/components/letsgo/profile/LinksManager';

export default function UserProfileContentManager() {
  const { data: session } = useSession();
  const slug = session?.user?.slug;

  const [desc, setDesc] = useState<any>(null);
  const [savedDesc, setSavedDesc] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!slug) {
      setIsLoadingProfile(false);
      return;
    }

    let cancelled = false;

    const loadProfile = async () => {
      setIsLoadingProfile(true);

      try {
        const response = await fetch(`/api/nextsteps/user/${slug}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Erro ao carregar perfil');
        }

        if (!cancelled) {
          setDesc(data.desc ?? null);
          setSavedDesc(data.desc ?? null);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Erro ao carregar perfil');
      } finally {
        if (!cancelled) {
          setIsLoadingProfile(false);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const handleSave = async () => {
    if (!slug) {
      toast.error('Slug do usuário não encontrado');
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/nextsteps/user/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ desc }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar descrição');
      }

      setDesc(data.desc ?? null);
      setSavedDesc(data.desc ?? null);
      toast.success('Descrição atualizada com sucesso!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar descrição');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setDesc(savedDesc);
  };

  return (
    <div className="min-h-screen bg-black px-4 py-24 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-4 border-b border-zinc-800 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-red-600">
              Next Steps
            </p>
            <h1 className="mt-3 text-4xl font-bold">Conteúdo do perfil</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400">
              Edite a descrição e os links exibidos na sua página pública.
            </p>
          </div>

          {slug && (
            <Link
              href={`/${slug}/profile`}
              className="inline-flex items-center justify-center rounded border border-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600/10"
            >
              Ver perfil público
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-xl border border-zinc-800 bg-[#141414] p-6">
            <div className="mb-5">
              <h2 className="text-2xl font-semibold">Descrição do perfil</h2>
              <p className="mt-2 text-sm text-zinc-400">
                Esse texto aparece no bloco principal de `/{slug}/profile`.
              </p>
            </div>

            {isLoadingProfile ? (
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6 text-sm text-zinc-400">
                Carregando descrição...
              </div>
            ) : (
              <div className="space-y-4">
                <TipTapEditor
                  content={desc}
                  onChange={(newContent) => setDesc(newContent)}
                  editable={true}
                />

                <div className="flex flex-wrap justify-end gap-3">
                  <button
                    onClick={handleReset}
                    disabled={isSaving}
                    className="rounded border border-zinc-700 px-5 py-2 text-sm font-medium text-zinc-200 transition hover:border-zinc-500 disabled:opacity-50"
                  >
                    Resetar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="rounded bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                  >
                    {isSaving ? 'Salvando...' : 'Salvar descrição'}
                  </button>
                </div>
              </div>
            )}
          </section>

          <section className="space-y-8">
            <div className="rounded-xl border border-zinc-800 bg-[#141414] p-6">
              <h2 className="text-2xl font-semibold">Links públicos</h2>
              <p className="mt-2 text-sm text-zinc-400">
                Adicione os links sociais e profissionais que aparecem no seu perfil.
              </p>

              <div className="mt-6">
                <LinksManager />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
