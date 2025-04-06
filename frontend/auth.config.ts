import type { NextAuthConfig } from "next-auth";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

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
        try {
          const userId = String(credentials.userId);
          const userType = credentials.userType as UserType;

          if (!userId || !userType) {
            console.warn(
              `Missing required credentials in authorize: userId:${userId}, userType:${userType}`,
            );
            return null;
          }

          // Return user data for NextAuth session, including custom userType for role-based access.
          return {
            id: userId,
            userType,
          };
        } catch (error) {
          console.error("Unexpected error in authorize:", error);
          return null;
        }
      },
    }),
  ],
};

export const { auth, signIn, signOut } = NextAuth(authConfig);
