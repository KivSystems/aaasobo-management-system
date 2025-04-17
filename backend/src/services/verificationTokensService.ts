import { v4 as uuidv4 } from "uuid";
import { prisma } from "../../prisma/prismaClient";

export const generateVerificationToken = async (email: string) => {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 60 * 60 * 1000);

  // Delete an existing token to make only the latest one valid
  const existingToken = await prisma.verificationToken.findFirst({
    where: { email },
  });

  if (existingToken) {
    await prisma.verificationToken.delete({
      where: { id: existingToken.id },
    });
  }

  return prisma.verificationToken.create({
    data: { email, token, expires },
  });
};

export const getVerificationTokenByToken = async (token: string) => {
  return await prisma.verificationToken.findUnique({
    where: { token },
  });
};

export const deleteVerificationToken = (email: string) => {
  return prisma.verificationToken.deleteMany({
    where: { email },
  });
};
