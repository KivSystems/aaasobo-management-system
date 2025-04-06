import NextAuth from "next-auth";
import { authConfig } from "../auth.config";

export default NextAuth(authConfig).auth;

// TODO: Define which URLs the middleware should run on with config.matcher
