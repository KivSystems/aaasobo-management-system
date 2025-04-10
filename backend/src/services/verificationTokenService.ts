import { v4 as uuidv4 } from "uuid";
import { prisma } from "../../prisma/prismaClient";
import { Prisma } from "@prisma/client";

export const generateVerificationToken = async (
  email: string,
  tx?: Prisma.TransactionClient,
) => {
  const db = tx ?? prisma;
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 60 * 60 * 1000);

  // Delete an existing token to make only the latest one valid
  const existingToken = await db.verificationToken.findFirst({
    where: { email },
  });

  if (existingToken) {
    await db.verificationToken.delete({
      where: { id: existingToken.id },
    });
  }

  return db.verificationToken.create({
    data: { email, token, expires },
  });
};

export const getVerificationTokenByToken = async (token: string) => {
  try {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    return verificationToken;
  } catch (error) {
    console.error("Database error while fetching verification token:", error);
    throw new Error(
      `Database error: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};
