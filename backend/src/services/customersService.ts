import { Customer } from "@prisma/client";
import { prisma } from "../../prisma/prismaClient";
import bcrypt from "bcrypt";

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
  // Check if customer already exists
  const existingCustomer = await prisma.customer.findUnique({
    where: { email },
  });

  if (existingCustomer) {
    const error = new Error(
      "This email address is already registered. Try a different one.",
    );
    (error as any).statusCode = 409;
    throw error;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert the customer data into the DB
  await prisma.customer.create({
    data: { name, email, password: hashedPassword, prefecture },
  });
};
