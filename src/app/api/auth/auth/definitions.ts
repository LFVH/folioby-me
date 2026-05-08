import { z } from 'zod';
import { normalizeProfileLink, PROFILE_LINK_OPTIONS } from '@/lib/profile-links';

export const SignupFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters long.' })
    .max(100, { message: 'Name is too long.' })
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

export const linkSchema = z.object({
  nr_redesocial: z.number().int().min(0).max(PROFILE_LINK_OPTIONS.length - 1),
  link: z.string().min(1),
  titulo: z.string().min(1).max(60)
}).superRefine((data, ctx) => {
  const normalizedLink = normalizeProfileLink(data.link, data.nr_redesocial)

  if (!normalizedLink.ok) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['link'],
      message: normalizedLink.error,
    })
  }
}).transform((data) => {
  const normalizedLink = normalizeProfileLink(data.link, data.nr_redesocial)

  if (!normalizedLink.ok) {
    return data
  }

  return {
    ...data,
    titulo: data.titulo.trim(),
    link: normalizedLink.value,
  }
})
