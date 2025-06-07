import NextAuth from "next-auth";
import { authConfig } from "../auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    "/admins/:path((?!login).*)", // Match all admin routes except /admins/login
    "/customers/:path((?!login|register).*)", // Match all customer routes except /customers/login and /customers/register
    "/instructors/:path((?!login).*)", // Match all instructor routes except /instructors/login
  ],
};
