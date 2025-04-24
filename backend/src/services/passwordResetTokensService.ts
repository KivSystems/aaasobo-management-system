import { v4 as uuidv4 } from "uuid";
import { prisma } from "../../prisma/prismaClient";

export const generatePasswordResetToken = async (email: string) => {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 60 * 60 * 1000);

  // Delete an existing token to make only the latest one valid
  const existingToken = await prisma.passwordResetToken.findFirst({
    where: { email },
  });

  if (existingToken) {
    await prisma.passwordResetToken.delete({
      where: {
        id: existingToken.id,
      },
    });
  }

  const passwordResetToken = await prisma.passwordResetToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  return passwordResetToken;
};

export const getPasswordResetTokenByToken = async (token: string) => {
  const passwordResetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  return passwordResetToken;
};

export const deletePasswordResetToken = (email: string) => {
  return prisma.passwordResetToken.deleteMany({
    where: { email },
  });
};
