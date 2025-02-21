import { authenticateUser } from "@/app/helper/api/usersApi";
import { userLoginSchema, userTypeSchema } from "@/app/schemas/authSchema";
import type { NextAuthConfig } from "next-auth";
import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { convertToSingular } from "./src/app/helper/utils/stringUtils";

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

    async authorized({ auth, request: { nextUrl } }): Promise<boolean> {
      const isLoggedIn = !!auth?.user;
      const userType = auth?.user?.userType;
      const userId = auth?.user?.id;

      // Check if the user is on customer dashboard (/customers/[id]/...) or instructor dashboard (/instructors/[id]/...)
      const matchPath = nextUrl.pathname.match(
        /^\/(customers|instructors)\/(\d+)(\/.*)?$/,
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
        // Validate email and password format
        const parsedCredentials = userLoginSchema.safeParse({
          email: credentials.email,
          password: credentials.password,
        });
        if (!parsedCredentials.success) {
          console.error("Invalid credentials received:");
          throw new CredentialsSignin("Invalid email or password.");
        }

        // Validate userType format
        const parsedUserType = userTypeSchema.safeParse(credentials.userType);
        if (!parsedUserType.success) {
          console.error("Invalid userType received:", credentials.userType);
          throw new CredentialsSignin(
            "Something went wrong. Please try again later.",
          );
        }

        // Authenticate the user with backend
        const { email, password } = parsedCredentials.data;
        const userType = parsedUserType.data;

        const result = await authenticateUser(email, password, userType);
        if (!result.success) {
          throw new CredentialsSignin(result.message);
        }
        const userId = result.userId ? String(result.userId) : undefined;
        if (!userId) {
          throw new CredentialsSignin(
            "Something went wrong. Please try again later.",
          );
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
