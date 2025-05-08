import { prisma } from "../../prisma/prismaClient";
import { Admins } from "@prisma/client";
import bcrypt from "bcrypt";
import { saltRounds } from "../helper/commonUtils";

// Register a new admin in the DB
export const registerAdmin = async (data: {
  name: string;
  email: string;
  password: string;
}) => {
  const hashedPassword = await bcrypt.hash(data.password, saltRounds);

  await prisma.admins.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
    },
  });

  return;
};

// Fetch all admins information
export const getAllAdmins = async () => {
  try {
    return await prisma.admins.findMany();
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch admins.");
  }
};

// Fetch the admin using the email
export const getAdminByEmail = async (
  email: string,
): Promise<Admins | null> => {
  return await prisma.admins.findUnique({
    where: { email },
  });
};

// Fetch the admin using the ID
export async function getAdminById(id: number) {
  try {
    return prisma.admins.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch admin.");
  }
}
