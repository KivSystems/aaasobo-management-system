import { Customer } from "@prisma/client";
import { prisma } from "../../prisma/prismaClient";
import bcrypt from "bcrypt";
import { saltRounds } from "../controllers/adminsController";

export const fetchCustomerById = async (
  customerId: number,
): Promise<Customer | null> => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new Error("Customer not found.");
    }

    return customer;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch customer.");
  }
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

export const getCustomerByEmail = async (email: string) => {
  try {
    return await prisma.customer.findUnique({
      where: { email },
    });
  } catch (error) {
    console.error(
      `Database error while getting customer by email (email: ${email}):`,
      error,
    );
    throw new Error(
      `Database error: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

export const registerCustomer = async ({
  name,
  email,
  password,
  prefecture,
}: {
  name: string;
  email: string;
  password: string;
  prefecture: string;
}) => {
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await prisma.customer.create({
      data: { name, email, password: hashedPassword, prefecture },
    });
  } catch (error) {
    console.error(
      `Database error while registering customer (email: ${email}):`,
      error,
    );
    throw new Error(
      `Database error: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};
