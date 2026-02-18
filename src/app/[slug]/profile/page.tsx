import { Metadata } from 'next';
import ProfileClient from './ProfileClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
//   try {
    // const res = await fetch(`${process.env.NEXTAUTH_URL}/api/nextsteps/user/${slug}`, {
    //   next: { revalidate: 3600 }
    // });
    
    // if (res.ok) {
    //   const user = await res.json();
      return {  
        title: `Profile`,
        description: `Profile`,
      };
//     }
//   } catch (error) {
//     console.error('Erro ao gerar metadata:', error);
//   }
  
  return { title: 'Perfil' };
}

export default async function ProfilePage({ params }: PageProps) {
  const { slug } = await params;
  
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/nextsteps/user/${slug}`    );
    if (!res.ok) {
      return <div>Usuário não encontrado</div>;
    }
    
    const user = await res.json();
    return <ProfileClient user={user} slug={slug} />;
  } catch (error) {

    console.log("ERRO AO CARREGAR")
    console.error(error)
    return <div>Erro ao carregar perfil</div>;
  }
}