import { v4 as uuidv4 } from "uuid";
import { prisma } from "../../prisma/prismaClient";

export const generatePasswordResetToken = async (email: string) => {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 60 * 60 * 1000);

  try {
    // Delete an existing token to make only the latest one valid
    const existingToken = await getPasswordResetTokenByEmail(email);

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
  } catch (error) {
    console.error(
      "Database error while creating a password reset token:",
      error,
    );
    throw new Error(
      `Database error: ${error instanceof Error ? error.message : "Failed to create a password reset token."}`,
    );
  }
};

export const getPasswordResetTokenByToken = async (token: string) => {
  try {
    const passwordResetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    return passwordResetToken;
  } catch (error) {
    console.error(
      "Database error while fetching a password reset token by token:",
      error,
    );
    throw new Error(
      `Database error: ${error instanceof Error ? error.message : "Failed to find a password reset token by token."}`,
    );
  }
};

export const getPasswordResetTokenByEmail = async (email: string) => {
  try {
    const passwordResetToken = await prisma.passwordResetToken.findFirst({
      where: { email },
    });

    return passwordResetToken;
  } catch (error) {
    console.error(
      "Database error while fetching a password reset token by email:",
      error,
    );
    throw new Error(
      `Database error: ${error instanceof Error ? error.message : "Failed to find a password reset token by email."}`,
    );
  }
};
