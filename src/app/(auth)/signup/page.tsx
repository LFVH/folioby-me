'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SignupForm } from '@/app/(auth)/signup/form';
export default function Page() {
  const router = useRouter();
  return (
    <div className="flex flex-col p-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-red-700">Create an account</h1>
        <p className="text-gray-500">Enter your information to get started</p>
      </div>
      <div className="mt-6">
        <SignupForm onLoginSuccess={() => {
    router.push('/');
  }}/>
      </div>
      <div className="mt-6 text-center text-sm text-green-800">
        Ao prosseguir você concorda com nossos Termos de Uso e Políticas de Privacidade.
      </div>
      <div className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link className="underline text-gray-400" href="/login">
          Login
        </Link>
      </div>
    </div>
  );
}