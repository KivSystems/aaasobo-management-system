import NextAuth from "next-auth";
import { authConfig } from "../auth.config";
import { headers } from "next/headers";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    "/admins/:path((?!login).*)", // Match all admin routes except /admins/login
    "/customers/:path((?!login|register).*)", // Match all customer routes except /customers/login and /customers/register
    "/instructors/:path((?!login).*)", // Match all instructor routes except /instructors/login
  ],
};

// Get the cookies from the request headers
export const getCookie = async () => {
  const cookie = headers().get("cookie");
  if (!cookie) {
    throw new Error("No cookies found in the request headers");
  }
  return cookie;
};
