import type { NextAuthConfig } from "next-auth";
import type { Account } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { z } from "zod";

import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

declare module "next-auth" {
  interface Account {
    prismaUserId?: string;
  }
}

export const authOptions: NextAuthConfig = {
  secret: env.NEXTAUTH_SECRET,
  trustHost: true,
  debug: env.NODE_ENV === "development",
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_MAIL_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_MAIL_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile https://www.googleapis.com/auth/gmail.readonly" 
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
 callbacks: {
    async signIn({ user, account }) {
      if (!user?.email || account?.provider !== "google") return false;

      // Check if user exists, create if not
      const dbUser = await prisma.user.upsert({
        where: { email: user.email },
        update: { name: user.name, image: user.image },
        create: { email: user.email, name: user.name, image: user.image },
      });

      // Upsert Google account
      await prisma.account.upsert({
        where: { provider_providerAccountId: { provider: "google", providerAccountId: String(account.id!) } },
        update: {
          access_token: account.access_token!,
          refresh_token: account.refresh_token!,
          scope: account.scope,
          id_token: account.id_token,
          token_type: account.token_type,
          expires_at: account.expires_at,
        },
        create: {
          userId: dbUser.id,
          provider: account.provider,
          providerAccountId: String(account.id!),
          access_token: account.access_token!,
          refresh_token: account.refresh_token!,
          scope: account.scope,
          id_token: account.id_token,
          token_type: account.token_type,
          expires_at: account.expires_at,
        },
      });

      (account as Account).prismaUserId = dbUser.id;

      return true;
    },
    async jwt({ token, user, account }) {
      // First login, store Prisma user ID in JWT
      if (account && user) {
        token.userId = (account as Account).prismaUserId ?? user.id;
      }
      return token;
    },

    async session({ session, token }) {
      // Map Prisma User ID to session.user.id
      if (session.user) {
        session.user.id = token.userId as string;
      }
      return session;
    },
  },
  pages: { signIn: "/signin" },
};
