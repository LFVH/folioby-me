'use server';

import bcrypt from 'bcryptjs';
import { after } from 'next/server';

import {
  FormState,
  SignupFormSchema,
} from '@/app/api/auth/auth/definitions';
import { generateAvailableUserSlug } from '@/lib/db/user-slug-service';
import { UserSlugError } from '@/lib/user-slug';
import { avisarCadastroNoTelegram } from '@/lib/telegram';

import Prisma from '../../../../prisma';

async function avisarDonoDoCadastro(usuario: { name: string; email: string; slug: string }) {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
    return;
  }

  try {
    const totalUsuarios = await Prisma.usuario.count().catch((error) => {
      console.error('Contagem de usuários para o aviso de cadastro falhou:', error instanceof Error ? error.message : error);
      return null;
    });
    await avisarCadastroNoTelegram({ nome: usuario.name, email: usuario.email, slug: usuario.slug, totalUsuarios });
  } catch (error) {
    // A conta já foi criada; o aviso é só conveniência e não muda o resultado do cadastro.
    console.error('Aviso de cadastro no Telegram falhou:', error instanceof Error ? error.message : error);
  }
}

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

    // Roda depois da resposta (na Vercel via waitUntil): o cadastro não espera pelo Telegram nem pela contagem.
    after(() => avisarDonoDoCadastro(userDB));

    return { data: {
        name: userDB.name,
        email: userDB.email,
      }
    };
  } catch (error) {
    if (error instanceof UserSlugError) {
      return {
        message: error.message,
      };
    }

    console.error('Erro ao criar conta:', error instanceof Error ? error.message : error);
    return {
      message: 'An error occurred while creating your account.',
    };
  }
}
