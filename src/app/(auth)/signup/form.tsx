'use client';

import { Label } from '@/components/signinsignup/label';
import { Input } from '@/components/signinsignup/input';
import { signup } from '@/app/api/auth/auth/signup';
import { useState, useEffect } from 'react';
import { signIn } from "next-auth/react"
import { SignupFormSchema } from '@/app/api/auth/auth/definitions';
import { useRouter, useSearchParams } from 'next/navigation';

interface SignupFormProps {
  onLoginSuccess: () => void;
}

interface FormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function SignupForm({ onLoginSuccess }: SignupFormProps) {
  const [errors, setErrors] = useState<{ 
    name?: string; 
    email?: string; 
    password?: string; 
    confirmPassword?: string;
    general?: string 
  }>({});
  const [formState, setFormState] = useState<FormState>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const assinaturaId = searchParams.get('plan');

  // Validação em tempo real
  useEffect(() => {
    if (formState.password && formState.confirmPassword) {
      setPasswordsMatch(formState.password === formState.confirmPassword);
    } else {
      setPasswordsMatch(true);
    }
  }, [formState.password, formState.confirmPassword]);

  const handleInputChange = (field: keyof FormState) => 
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormState(prev => ({
        ...prev,
        [field]: event.target.value
      }));
      
      // Limpa erro específico quando o usuário começa a digitar
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: undefined }));
      }
    };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});
    setIsLoading(true);

    // Validação da confirmação de senha
    if (formState.password !== formState.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      setIsLoading(false);
      return;
    }

    const validatedFields = SignupFormSchema.safeParse({
      name: formState.name,
      email: formState.email,
      password: formState.password,
    });

    if (!validatedFields.success) {
      const fieldErrors = validatedFields.error.flatten().fieldErrors;
      setErrors({
        name: fieldErrors.name?.[0],
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('name', formState.name);
    formData.append('email', formState.email.toLowerCase());
    formData.append('password', formState.password);

    const result = await signup(undefined, formData);
    setIsLoading(false);

    if (result?.errors) {
      setErrors({
        email: result.errors.email?.[0],
        password: result.errors.password?.[0],
        name: result.errors.name?.[0],
      });
      return;
    }

    if (result?.message) {
      setErrors({ general: result.message });
      return;
    }

    await signIn("credentials", {
      email: result?.data?.email,
      password: formState.password,
      redirect: false,
    });

    if (assinaturaId) {
      router.push(`/?plan=${assinaturaId}`);
    } else {
      onLoginSuccess?.();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4">
        {/* Nome */}
        <div>
          <Label htmlFor="name">Name</Label>
          <Input 
            id="name" 
            name="name" 
            placeholder="John Macgo" 
            value={formState.name}
            onChange={handleInputChange('name')}
            required
          />
          {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
        </div>
        
        {/* Email */}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            name="email" 
            type="email"
            placeholder="john@example.com" 
            value={formState.email}
            onChange={handleInputChange('email')}
            required
          />
          {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
        </div>
        
        {/* Senha */}
        <div>
          <Label htmlFor="password">Password</Label>
          <Input 
            id="password" 
            name="password" 
            type="password" 
            value={formState.password}
            onChange={handleInputChange('password')}
            required
          />
          {errors.password && (
            <div className="text-sm text-red-500 mt-1">
              <p>{errors.password}</p>
            </div>
          )}
        </div>
        
        {/* Confirmar Senha */}
        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input 
            id="confirmPassword" 
            name="confirmPassword" 
            type="password" 
            value={formState.confirmPassword}
            onChange={handleInputChange('confirmPassword')}
            required
          />
          {!passwordsMatch && formState.confirmPassword && (
            <p className="text-sm text-red-500 mt-1">Passwords do not match</p>
          )}
          {errors.confirmPassword && (
            <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>
          )}
        </div>
        
        {/* Erro geral */}
        {errors.general && (
          <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{errors.general}</p>
        )}

        <SignupButton isLoading={isLoading} passwordsMatch={passwordsMatch} />
      </div>
    </form>
  );
}

export function SignupButton({ isLoading, passwordsMatch }: { isLoading: boolean; passwordsMatch: boolean }) {
  const isDisabled = isLoading || !passwordsMatch;

  return (
    <div className="mt-2">
      <button 
        disabled={isDisabled} 
        type="submit" 
        className="w-full bg-red-600 text-white py-3 px-4 rounded-md font-medium text-sm hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Creating account...' : 'Sign up'}
      </button>
    </div>
  );
}