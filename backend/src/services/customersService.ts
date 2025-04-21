import { Customer, Prisma } from "@prisma/client";
import { prisma } from "../../prisma/prismaClient";
import bcrypt from "bcrypt";
import { saltRounds } from "../controllers/adminsController";

export const getCustomerById = async (customerId: number) => {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
  });

  if (!customer) {
    return null;
  }

  const { password, ...customerWithoutPassword } = customer;
  return customerWithoutPassword;
};

export const updateCustomer = async (
  id: number,
  name: string,
  email: string,
  prefecture: string,
) => {
  try {
    // Update the Customer data.
    const customer = await prisma.customer.update({
      where: {
        id,
      },
      data: {
        name,
        email,
        prefecture,
      },
    });

    return customer;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to update the customer data.");
  }
};

// Fetch all customers information
export const getAllCustomers = async () => {
  try {
    return await prisma.customer.findMany();
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch customers.");
  }
};

export const getCustomerByEmail = async (
  email: string,
): Promise<Customer | null> => {
  return await prisma.customer.findUnique({
    where: { email },
  });
};

export const registerCustomer = async (
  data: {
    name: string;
    email: string;
    password: string;
    prefecture: string;
  },
  tx?: Prisma.TransactionClient,
) => {
  const db = tx ?? prisma;
  const hashedPassword = await bcrypt.hash(data.password, saltRounds);

  const customer = await db.customer.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      prefecture: data.prefecture,
    },
  });

  return {
    id: customer.id,
    name: customer.name,
  };
};

export const verifyCustomerEmail = async (
  id: number,
  email: string,
): Promise<void> => {
  await prisma.customer.update({
    where: {
      id,
    },
    data: {
      emailVerified: new Date(),
      email,
    },
  });
};

export const updateCustomerPassword = async (
  id: number,
  newPassword: string,
) => {
  return await prisma.customer.update({
    where: { id },
    data: { password: newPassword },
  });
};

export const deleteCustomer = async (
  id: number,
  tx?: Prisma.TransactionClient,
) => {
  const db = tx ?? prisma;
  await db.customer.delete({
    where: {
      id,
    },
  });
};
