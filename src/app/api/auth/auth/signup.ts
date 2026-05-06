'use server';

import bcrypt from 'bcryptjs';

import {
  FormState,
  SignupFormSchema,
} from '@/app/api/auth/auth/definitions';
import { generateAvailableUserSlug } from '@/lib/db/user-slug-service';
import { UserSlugError } from '@/lib/user-slug';

import Prisma from '../../../../prisma';

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
  const slug = await generateAvailableUserSlug(name);

  try {
    const userDB = await Prisma.usuario.create({
      data: {
        name,
        email,
        password: hashedPassword,
        slug,
        dtIniPremium: new Date(),
        dtFimPremium: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        statusAss: 6,
        isPremium: true,
      },
    });
    await Prisma.categoria.create({
          data: {
            name: "My Work",
            user: {
              connect: {
                id: userDB.id,
              },
            },
          },
        });



    return { data: {
        name: userDB.name,
        email: userDB.email,
        password: userDB.password,
        id: userDB.id,
      }
    };
  } catch (error) {
    if (error instanceof UserSlugError) {
      return {
        message: error.message,
      };
    }

    return {
      message: 'An error occurred while creating your account.',
    };
  }
}
