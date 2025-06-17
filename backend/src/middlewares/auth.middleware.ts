import { NextFunction, Request, Response } from "express";
import { webcrypto } from "node:crypto";
import hkdf from "@panva/hkdf";

if (!globalThis.crypto) {
  // @ts-ignore
  globalThis.crypto = webcrypto;
}

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    userType: string;
  };
}

async function getDerivedEncryptionKey(secret: string, salt: string) {
  return await hkdf(
    "sha256",
    secret,
    salt,
    `NextAuth.js Generated Encryption Key (${salt})`,
    64,
  );
}

export async function verifyAuthentication(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const { compactDecrypt } = await import("jose");

  // TODO: Use the AUTH_SECRET from environment variables
  // const secret = process.env.AUTH_SECRET!;
  const salt = process.env.AUTH_SALT!;

  const token = req.headers.cookie
    ?.split("; ")
    .find((cookie) => cookie.startsWith(`${salt}=`))
    ?.split("=")[1];

  if (!token) {
    return res.status(401).json({ message: "No session token found" });
  }

  try {
    // TODO: Decrypt the token using the secret and salt.
    // REFERENCE: https://medium.com/@g-mayer/fixing-jwt-decryption-issues-with-auth-js-v5-in-a-fastify-api-9b5ad4869be0
    // const encryptionKey = await getDerivedEncryptionKey(secret, salt);
    // const { plaintext } = await compactDecrypt(token, encryptionKey);
    // const decodedPayload = JSON.parse(new TextDecoder().decode(plaintext));
    // req.user = {
    //   id: decodedPayload.id as string,
    //   userType: decodedPayload.userType as string,
    // };

    // NOTE: Until the above is implemented, authentication will be based on whether the specific token exists.

    next();
  } catch (error) {
    console.error("JWT decryption failed:", error);
    return res.status(401).json({ message: "Invalid session token" });
  }
}
