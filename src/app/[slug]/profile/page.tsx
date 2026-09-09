import { notFound } from 'next/navigation';
import ProfileClient from './ProfileClient';
import { isFileLikeUserSlug } from '@/lib/user-slug';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProfilePage({ params }: PageProps) {
  const { slug } = await params;

  if (isFileLikeUserSlug(slug)) {
    notFound();
  }

  let user: unknown = null;

  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/letsgo/user/${slug}`);

    if (!res.ok) {
      notFound();
    }

    user = await res.json();
  } catch (error) {
    console.log('ERRO AO CARREGAR');
    console.error(error);
    return <div>Erro ao carregar perfil</div>;
  }

  if (!user) {
    return <div>Usuário não encontrado</div>;
  }

  return <ProfileClient user={user} />;
}
