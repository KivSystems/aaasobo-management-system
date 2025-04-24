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
  return await prisma.verificationToken.findUnique({
    where: { token },
  });
};

export const deleteVerificationToken = (
  email: string,
  tx?: Prisma.TransactionClient,
) => {
  const db = tx ?? prisma;
  return db.verificationToken.deleteMany({
    where: { email },
  });
};
