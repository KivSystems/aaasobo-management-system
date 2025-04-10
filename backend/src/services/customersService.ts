import { Customer } from "@prisma/client";
import { prisma } from "../../prisma/prismaClient";
import bcrypt from "bcrypt";
import { generateVerificationToken } from "./verificationTokenService";
import { sendVerificationEmail } from "../helper/mail";
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

export const getCustomerByEmail = async (
  email: string,
): Promise<Customer | null> => {
  return await prisma.customer.findUnique({
    where: { email },
  });
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
  // Hash password
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Use a Prisma transaction to ensure all customer register operations succeed together, or none should be applied
  const result = await prisma.$transaction(async (tx) => {
    // Insert the customer data into the DB
    const customer = await tx.customer.create({
      data: { name, email, password: hashedPassword, prefecture },
    });

    // Generate email verification token
    const verificationToken = await generateVerificationToken(email, tx);

    return { customerId: customer.id, verificationToken };
  });

  // Send verification email
  const sendResult = await sendVerificationEmail(
    result.verificationToken.email,
    result.verificationToken.token,
    "customer",
  );

  if (!sendResult.success) {
    await prisma.$transaction([
      prisma.verificationToken.deleteMany({
        where: { email },
      }),
      prisma.customer.delete({
        where: { id: result.customerId },
      }),
    ]);

    throw new Error("Failed to send the confirmation email.");
  }
};

export const verifyCustomerEmail = async (
  id: number,
  email: string,
): Promise<void> => {
  try {
    await prisma.customer.update({
      where: {
        id,
      },
      data: {
        emailVerified: new Date(),
        email,
      },
    });
  } catch (error) {
    console.error(
      `Database error while verifying customer email (ID: ${id}):`,
      error,
    );
    throw new Error(
      `Database error: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};
