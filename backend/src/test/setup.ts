import { beforeAll, afterAll, beforeEach } from "vitest";
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";

let postgresContainer: StartedPostgreSqlContainer | undefined;
let prisma: PrismaClient;

beforeAll(async () => {
  // Check if TEST_DATABASE_URL is provided
  if (process.env.TEST_DATABASE_URL) {
    // Use provided test database
    process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
    console.log("Using provided TEST_DATABASE_URL for tests");
  } else {
    // Start PostgreSQL container with Testcontainers
    // Using PostgreSQL 16 to match Vercel Postgres production version (16.9)
    console.log("Starting PostgreSQL container...");
    postgresContainer = await new PostgreSqlContainer("postgres:16-alpine")
      .withDatabase("test_db")
      .withUsername("test_user")
      .withPassword("test_password")
      .start();

    // Set DATABASE_URL to the container's connection string
    process.env.DATABASE_URL = postgresContainer.getConnectionUri();
    console.log("PostgreSQL container started");
  }

  // Initialize Prisma client
  prisma = new PrismaClient();

  // Apply Prisma schema using db push
  console.log("Applying Prisma schema...");
  execSync("npx prisma db push --skip-generate", {
    stdio: "inherit",
    env: process.env,
  });
  console.log("Prisma schema applied");

  // Connect Prisma client
  await prisma.$connect();
  console.log("Prisma client connected");
}, 60000); // 60 second timeout for container startup

beforeEach(async () => {
  // Truncate all tables before each test to ensure isolation
  await truncateAllTables();
});

afterAll(async () => {
  // Disconnect Prisma client
  if (prisma) {
    await prisma.$disconnect();
    console.log("Prisma client disconnected");
  }

  // Stop the container if we started it
  if (postgresContainer) {
    await postgresContainer.stop();
    console.log("PostgreSQL container stopped");
  }
});

async function truncateAllTables() {
  const tables = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  // Disable foreign key checks temporarily
  await prisma.$executeRaw`SET session_replication_role = replica;`;

  // Truncate all tables
  for (const { tablename } of tables) {
    if (tablename !== "_prisma_migrations") {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE;`);
    }
  }

  // Re-enable foreign key checks
  await prisma.$executeRaw`SET session_replication_role = DEFAULT;`;
}

// Export prisma instance for use in tests
export { prisma };
