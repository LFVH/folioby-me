'use client';
import { useRouter } from 'next/navigation';
import { LoginForm } from './form';
import Link from 'next/link';

export default function Page() {
  const router = useRouter();

  // Função para tratar o sucesso do login
  const handleLoginSuccess = () => {
    router.push('/');
  };

  return (
    <div className="flex flex-col p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">Login</h1>
        <p className="text-gray-300 mt-2">
          Enter your email below to login to your account
        </p>
      </div>
      <div className="mt-6">
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      </div>
      <div className="mt-4 text-center text-sm text-gray-300">
        Don&apos;t have an account?{' '}
        <Link className="text-red-500 hover:text-red-400 underline" href="/signup">
          Sign up
        </Link>
      </div>
    </div>
  );
}