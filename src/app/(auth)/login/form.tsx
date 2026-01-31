'use client';

import { Input } from '@/components/signinsignup/input';
import { Label } from '@/components/signinsignup/label';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { LoginFormSchema } from '@/app/api/auth/auth/definitions';
import { useRouter, useSearchParams } from 'next/navigation';

interface LoginFormProps {
  onLoginSuccess: () => void;
}

export const LoginForm = ({ onLoginSuccess }: LoginFormProps) => {
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Pega o ID da assinatura da URL
  const assinaturaId = searchParams.get('plan');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const validatedFields = LoginFormSchema.safeParse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    if (!validatedFields.success) {
      const fieldErrors = validatedFields.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      setIsLoading(false);
      return;
    }

    const { email, password } = validatedFields.data;

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setIsLoading(false);

    if (result?.error) {
      setErrors((prev) => ({ ...prev, general: result.error ?? 'Login failed' }));
    } else {
      if (assinaturaId) {
        // Redireciona para o pagamento com a assinatura
        router.push(`/?plan=${assinaturaId}`);
      } else{
        onLoginSuccess();
      }
    }
  };

return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4">
        <div>
          <Label htmlFor="email" className="text-white">Email</Label>
          <Input 
            id="email" 
            name="email" 
            placeholder="m@example.com" 
            type="email" 
            required 
            className="bg-gray-800 border-gray-700 text-white"
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
        </div>
        <div>
          <Label htmlFor="password" className="text-white">Password</Label>
          <Input 
            id="password" 
            type="password" 
            name="password" 
            required 
            className="bg-gray-800 border-gray-700 text-white"
          />
          {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
          <div className="flex items-center justify-between mt-2">
            <Link className="text-sm text-red-500 hover:text-red-400 underline" href="#">
              Forgot your password?
            </Link>
          </div>
        </div>
        {errors.general && (
          <p className="text-sm text-red-500">{errors.general}</p>
        )}
        <LoginButton isLoading={isLoading} />
      </div>
    </form>
  );
};

export function LoginButton({ isLoading }: { isLoading: boolean }) {
  return (
    <div className="mt-4">
      <button 
        disabled={isLoading} 
        type="submit" 
        className="w-full bg-red-600 text-white py-3 px-4 rounded-md font-medium text-sm hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Signing in...' : 'Sign in'}
      </button>
    </div>
  );
}
