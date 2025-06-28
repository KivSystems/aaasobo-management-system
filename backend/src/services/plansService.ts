import { prisma } from "../../prisma/prismaClient";

// Register a new plan in the DB
export const registerPlan = async (data: {
  name: string;
  weeklyClassTimes: number;
  description: string;
}) => {
  await prisma.plan.create({ data });

  return;
};

// Fetch all plan data.
export const getAllPlans = async () => {
  try {
    return await prisma.plan.findMany();
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch plans.");
  }
};

// Fetch the number of weekly class times by ID.
export const getWeeklyClassTimes = async (id: number) => {
  try {
    return await prisma.plan.findUnique({
      where: { id },
      select: { weeklyClassTimes: true },
    });
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch weekly class times.");
  }
};

// Fetch the plan using the ID
export async function getPlanById(id: number) {
  try {
    return prisma.plan.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch plan.");
  }
}
