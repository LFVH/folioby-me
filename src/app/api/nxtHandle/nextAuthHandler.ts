import { AuthOptions } from "next-auth"
import prisma from "../../../prisma"
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
          console.log(`senha incorreta do camarada ${user.email}`)
          throw new Error("Usuário ou senha incorreta.");
        }
         const isAdmin = await isActuallyChief(user.id);

        return { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          status: user.isPremium,
          role: isAdmin ? 'chief' : 'user',
          slug: user.slug,
          image: user.image || ''
        }; 
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user,  trigger, session  }: any) {
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
          slug: user.slug || '',
          image: user.image || ''
        };
      }
      if (trigger === 'update' && session) {
          const dbUser = await prisma.usuario.findUnique({
          where: { email: token.user.email }, 
          select: {
            id: true,
            name: true,
            email: true,
            isPremium: true,
            slug: true,
            image: true,
          }
        });
        if (dbUser) {
          const expiresIn = dayjs().add(7, "days").unix();
          await prisma.refreshToken.upsert({
            where: { userId: dbUser.id },
            create: { userId: dbUser.id , expiresIn },
            update: { expiresIn },
          });
        token.user = {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name || null,
          status: dbUser.isPremium || null,
          role: 'user',
          slug: dbUser.slug || '',
          image: dbUser.image || ''
        };
        }
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