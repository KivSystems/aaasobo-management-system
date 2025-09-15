import type { NextAuthConfig } from "next-auth";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { SignJWT, jwtVerify } from "jose";
import { convertToSingular } from "./src/app/helper/utils/stringUtils";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/",
  },

  secret: process.env.AUTH_SECRET,

  session: {
    strategy: "jwt",
  },

  jwt: {
    encode: async ({ token, secret }) => {
      if (!secret) throw new Error("Missing secret for JWT encoding");
      const secretString = Array.isArray(secret) ? secret[0] : secret;
      return new SignJWT(token)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24hrs")
        .sign(new TextEncoder().encode(secretString));
    },
    decode: async ({ token, secret }) => {
      if (!secret) throw new Error("Missing secret for JWT decoding");
      const secretString = Array.isArray(secret) ? secret[0] : secret;
      return jwtVerify(token!, new TextEncoder().encode(secretString)).then(
        (res) => res.payload,
      );
    },
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

    async authorized({ auth, request: { nextUrl } }): Promise<boolean> {
      const isLoggedIn = !!auth?.user;
      const userType = auth?.user?.userType;
      const userId = auth?.user?.id;

      // Check if the user is on customer dashboard (/customers/[id]/...), instructor dashboard (/instructors/[id]/...), or admin dashboard (/admin/[id]/...).
      const matchPath = nextUrl.pathname.match(
        /^\/(customers|instructors|admins)\/(\d+)(\/.*)?$/,
      );

      if (!matchPath) {
        return true; // Allow access to other pages
      }

      const [_, pluralRole, pathId] = matchPath;
      const role = convertToSingular(pluralRole);

      if (isLoggedIn && userType === role && userId === pathId) {
        return true; // Authorized
      }

      return false; // Unauthorized
    },
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
