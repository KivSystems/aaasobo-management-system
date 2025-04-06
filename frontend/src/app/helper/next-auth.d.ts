import { DefaultUser, DefaultSession, DefaultJWT } from "next-auth";

// Extend the default User object
declare module "next-auth" {
  interface User extends DefaultUser {
    userType: UserType;
  }

  // Extend the default Session object
  interface Session extends DefaultSession {
    user: User;
  }

  // Extend the default JWT object
  interface JWT extends DefaultJWT {
    userType: UserType;
  }
}
