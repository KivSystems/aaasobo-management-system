import { Prisma } from "@prisma/client";
import { prisma } from "../../prisma/prismaClient";

export const getChildren = async (customerId: string) => {
  // Fetch the Children data from the DB
  try {
    const children = await prisma.children.findMany({
      where: { customerId: parseInt(customerId) },
      include: { customer: true },
      orderBy: { id: "asc" },
    });

    return children;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch children.");
  }
};

export const registerChild = async (
  name: string,
  birthdate: string,
  personalInfo: string,
  customerId: number,
  tx?: Prisma.TransactionClient,
) => {
  const db = tx ?? prisma;

  const child = await db.children.create({
    data: {
      name,
      birthdate,
      personalInfo,
      customerId,
    },
  });

  return child;
};

export const updateChild = async (
  childId: number,
  name: string,
  birthdate: string,
  personalInfo: string,
  customerId: number,
) => {
  try {
    // Update the Child data.
    const child = await prisma.children.update({
      where: {
        id: childId,
      },
      data: {
        name,
        birthdate,
        personalInfo,
        customerId,
      },
    });

    return child;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to update a child.");
  }
};

export const deleteChild = async (
  tx: Prisma.TransactionClient,
  childId: number,
) => {
  const child = await tx.children.delete({
    where: { id: childId },
  });

  return child;
};

export const getChildById = async (id: number) => {
  try {
    const child = await prisma.children.findUnique({
      where: { id },
    });

    return child;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch child.");
  }
};

export const getAllChildren = async () => {
  // Fetch the Children data from the DB
  try {
    const children = await prisma.children.findMany({
      include: { customer: true },
      orderBy: { id: "asc" },
    });

    return children;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch all children.");
  }
};

export const getChildProfiles = async (customerId: number) => {
  const children = await prisma.children.findMany({
    where: { customerId },
  });
  const childProfiles = children.map((child) => ({
    id: child.id,
    name: child.name,
    birthdate: child.birthdate,
    personalInfo: child.personalInfo,
  }));

  return childProfiles;
};

export const getChildrenNamesByIds = async (
  childrenIds: number[],
): Promise<string> => {
  const children = await prisma.children.findMany({
    where: {
      id: {
        in: childrenIds,
      },
    },
    select: {
      name: true,
    },
  });

  return children.map((child) => child.name).join(", ");
};
