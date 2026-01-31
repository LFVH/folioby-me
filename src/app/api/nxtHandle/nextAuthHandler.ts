import { AuthOptions } from "next-auth"
import prisma from "@/database/prisma"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from 'bcryptjs';
import dayjs from "dayjs"
import { isActuallyChief as isActuallyChief } from "@/utils/verifyUserAuth";

const AuthHandler :AuthOptions= {
  pages: {
    error: "/",
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Credenciais inválidas.");
        }
        const user = await prisma.usuario.findUnique({
          where: { email: credentials.email },
        });
        if (!user) {
          throw new Error("Usuário ou senha incorretos.");
        }
        if (user.isBlocked) {
          throw new Error("Código 101");
        }
        const passwordMatch = await bcrypt.compare(credentials.password, user.password);
        if (!passwordMatch) {
          throw new Error("Senha incorreta.");
        }
         const isAdmin = await isActuallyChief(user.id);

        return { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          status: user.isPremium,
          role: isAdmin ? 'chief' : 'user'
        }; 
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        const expiresIn = dayjs().add(7, "days").unix();
        await prisma.refreshToken.upsert({
          where: { userId: user.id },
          create: { userId: user.id, expiresIn },
          update: { expiresIn },
        });
        token.user = {
          id: user.id,
          email: user.email,
          name: user.name || null,
          status: user.status || null,
          role: user.role || 'user',
        };
      }
      return token;
    },

  async session({ session, token }) {
    if (token.user) {
      session.user = {
        ...session.user, 
        ...token.user,   
      };
      
      session.status = token.user.status;
      session.id = token.user.id;
    }
    return session;
  },
  },
}


export default AuthHandler