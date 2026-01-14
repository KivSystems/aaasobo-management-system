import NextAuth from "next-auth";
import { headers } from "next/headers";
import { authConfig } from "../auth.config";

const { auth } = NextAuth(authConfig);

export const proxy = auth;

export const config = {
  matcher: [
    "/admins/:path((?!login).*)", // Match all admin routes except /admins/login
    "/customers/:path((?!login|register).*)", // Match all customer routes except /customers/login and /customers/register
    "/instructors/:path((?!login).*)", // Match all instructor routes except /instructors/login
  ],
};

// Get the cookies from the request headers
export const getCookie = async () => {
  const cookie = (await headers()).get("cookie");
  if (!cookie) {
    throw new Error("No cookies found in the request headers");
  }
  return cookie;
};
