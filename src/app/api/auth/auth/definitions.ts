import { z } from 'zod';

export const SignupFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters long.' })
    .trim(),
  email: z.string().email({ message: 'Please enter a valid email.' }).trim().transform(email => email.toLowerCase()),
  password: z
    .string()
    .min(8, { message: 'Be at least 8 characters long' })
    .trim(),
});

export const LoginFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }).transform(email => email.toLowerCase()),
  password: z.string().min(1, { message: 'Password field must not be empty.' }),
});

export type FormState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
      };
      message?: string;
      data?: {
         name?: string; email?: string; password?: string; id?: string;
      };
    }
  | undefined;

export type SessionPayload = {
  sessionId: number;
  userId: string | number;
  expiresAt: Date;
};