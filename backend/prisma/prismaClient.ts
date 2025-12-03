import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "../generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.POSTGRES_PRISMA_URL,
});

export const prisma = new PrismaClient({
  adapter,
  transactionOptions: {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    maxWait: 5000,
    timeout: 60000,
  },
});
