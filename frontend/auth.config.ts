import { authenticateUser } from "@/app/helper/api/usersApi";
import { userLoginSchema, userTypeSchema } from "@/app/schemas/authSchema";
import type { NextAuthConfig } from "next-auth";
import NextAuth, { CredentialsSignin } from "next-auth";
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
        // Validate email and password format
        const parsedCredentials = userLoginSchema.safeParse({
          email: credentials.email,
          password: credentials.password,
        });
        if (!parsedCredentials.success) {
          console.error("Invalid credentials received:");
          return null;
        }

        // Validate userType format
        const parsedUserType = userTypeSchema.safeParse(credentials.userType);
        if (!parsedUserType.success) {
          console.error("Invalid userType received:", credentials.userType);
          throw new CredentialsSignin("Unexpected error");
        }

        // Authenticate the user with backend
        const { email, password } = parsedCredentials.data;
        const userType = parsedUserType.data;

        const result = await authenticateUser(email, password, userType);
        if (!result.success) {
          return null;
        }
        const userId = result.userId ? String(result.userId) : undefined;
        if (!userId) {
          throw new CredentialsSignin("Unexpected error");
        }

        // Return user data for NextAuth session, including custom userType for role-based access.
        return {
          id: userId,
          userType,
        };
      },
    }),
  ],
};

export const { auth, signIn, signOut } = NextAuth(authConfig);
