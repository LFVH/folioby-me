import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProfileClient, { type User } from './ProfileClient';
import { isFileLikeUserSlug } from '@/lib/user-slug';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const getProfileUser = cache(async (slug: string): Promise<User | null> => {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/letsgo/user/${slug}`);

  if (!res.ok) {
    return null;
  }

  return res.json();
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  if (isFileLikeUserSlug(slug)) {
    return {};
  }

  try {
    const user = await getProfileUser(slug);

    if (!user) {
      return {};
    }

    const description = `Conheça ${user.name} e encontre seus links de contato no FolioBy.`;

    return {
      title: `${user.name} - Perfil e contatos | FolioBy`,
      description,
      openGraph: {
        title: `${user.name} | FolioBy`,
        description,
        type: 'profile',
        images: [user.image || 'https://folioby.me/exemplos/ilustracao-portfolio.png'],
      },
      twitter: {
        card: 'summary',
        title: `${user.name} - Perfil`,
        description,
      },
    };
  } catch (error) {
    console.error('Erro ao gerar metadados do perfil:', error instanceof Error ? error.message : error);
    return {};
  }
}

export default async function ProfilePage({ params }: PageProps) {
  const { slug } = await params;

  if (isFileLikeUserSlug(slug)) {
    notFound();
  }

  let user: User | null = null;

  try {
    user = await getProfileUser(slug);
  } catch (error) {
    console.error(error);
    return <div>Erro ao carregar perfil</div>;
  }

  if (!user) {
    notFound();
  }

  if (!user) {
    return <div>Usuário não encontrado</div>;
  }

  return <ProfileClient user={user} />;
}
