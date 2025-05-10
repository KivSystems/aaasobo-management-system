import { Prisma, PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  transactionOptions: {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    maxWait: 5000, // default: 2000
    timeout: 60000, // default: 5000
  },
});
