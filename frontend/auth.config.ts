import type { NextAuthConfig } from "next-auth";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userType = user.userType;
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.userType = token.userType as UserType;
        session.user.id = token.id as string;
      }
      return session;
    },

    // TODO: Define "authorized" callback here
  },

  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({
            userId: z.string(),
            userType: z.enum(["admin", "customer", "instructor"]),
          })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { userId, userType } = parsedCredentials.data;

          return {
            id: userId,
            userType,
          };
        }
        return null;
      },
    }),
  ],
};

export const { auth, signIn, signOut } = NextAuth(authConfig);
