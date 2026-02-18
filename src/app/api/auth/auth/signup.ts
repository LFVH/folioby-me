'use server';

import {
  FormState,
  SignupFormSchema,
} from '@/app/api/auth/auth/definitions';
import bcrypt from 'bcryptjs';
import Prisma from '../../../../prisma';
import { criarURL } from '@/lib/utils';

export async function signup(
  state: FormState,
  formData: FormData,
): Promise<FormState> {

  const validatedFields = SignupFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = validatedFields.data;

  const existingUser = await Prisma.usuario.findFirst({
    where: {
      email: validatedFields.data.email,
    }, 
  });

  if (existingUser) {
    return {
      message: 'Email already exists, please use a different email or login.',
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const slug = criarURL(name);
  const userDB = await Prisma.usuario.create({
    data: {
      name,
      email,
      password: hashedPassword,
      slug
    },
  })

  if (!userDB) {
    return {
      message: 'An error occurred while creating your account.',
    };
  }

  const userId = userDB.id.toString();
  return {data:{
      name: userDB.name,
      email: userDB.email,
      password: userDB.password, 
      id: userDB.id,
    }
  }
}