import { v4 as uuidv4 } from "uuid";
import { prisma } from "../../prisma/prismaClient";

export const generateVerificationToken = async (email: string) => {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 60 * 60 * 1000);

  try {
    // Delete an existing token to make only the latest one valid
    const existingToken = await getVerificationTokenByEmail(email);

    if (existingToken) {
      await prisma.verificationToken.delete({
        where: {
          id: existingToken.id,
        },
      });
    }

    const verificationToken = await prisma.verificationToken.create({
      data: {
        email,
        token,
        expires,
      },
    });

    return verificationToken;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to create a verification token.");
  }
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

export const getVerificationTokenByEmail = async (email: string) => {
  try {
    const verificationToken = await prisma.verificationToken.findFirst({
      where: { email },
    });

    return verificationToken;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to get a verification token by email.");
  }
};
