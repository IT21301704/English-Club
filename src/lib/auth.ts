import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await db.user.findUnique({ where: { email: credentials.email } });
        if (!user || !user.passwordHash) return null;
        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) return null;
        if (!user.isActive) throw new Error('Account suspended');
        return { id: user.id, name: user.name, email: user.email, role: user.role, image: user.avatar };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) { token.role = (user as any).role; token.id = user.id; }
      // Client called useSession().update() after a profile edit — reload display fields.
      if (trigger === 'update' && token.id) {
        const fresh = await db.user.findUnique({ where: { id: token.id as string }, select: { name: true, avatar: true } });
        if (fresh) { token.name = fresh.name; token.picture = fresh.avatar; }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
};
