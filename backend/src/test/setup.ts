import { afterAll, beforeEach } from "vitest";
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";
import { execSync } from "child_process";

const { faker } = require("@faker-js/faker");

let postgresContainer: StartedPostgreSqlContainer | undefined;
let prisma!: PrismaClient;
let prismaInitialized = false;

// IMPORTANT: this module runs before each test file is evaluated.
// We initialize the DB connection at module load time so that any modules
// imported by the tests (e.g. `server`, which imports `prismaClient`) see the
// correct connection string immediately.
await (async () => {
  try {
    // Check if TEST_DATABASE_URL is provided
    if (process.env.TEST_DATABASE_URL) {
      // Use provided test database
      process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
      process.env.POSTGRES_PRISMA_URL = process.env.TEST_DATABASE_URL;
      console.log("Using provided TEST_DATABASE_URL for tests");
    } else {
      // Using PostgreSQL 16 to match Vercel Postgres production version (16.9)
      console.log("Starting PostgreSQL container...");
      postgresContainer = await new PostgreSqlContainer("postgres:16-alpine")
        .withDatabase("test_db")
        .withUsername("test_user")
        .withPassword("test_password")
        .start();

      process.env.DATABASE_URL = postgresContainer.getConnectionUri();
      process.env.POSTGRES_PRISMA_URL = postgresContainer.getConnectionUri();
      console.log("PostgreSQL container started");
    }

    // Initialize Prisma client (engineType="client" requires a driver adapter)
    const adapter = new PrismaPg({
      connectionString: process.env.POSTGRES_PRISMA_URL,
    });
    prisma = new PrismaClient({ adapter });

    // Apply Prisma schema using db push
    console.log("Applying Prisma schema...");
    execSync("npx prisma db push --accept-data-loss", {
      stdio: "inherit",
      env: process.env,
    });
    console.log("Prisma schema applied");

    // Connect Prisma client
    await prisma.$connect();
    prismaInitialized = true;
    console.log("Prisma client connected");

    // Set consistent seed for reproducible test data
    faker.seed(12345);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      [
        "Test database setup failed.",
        message,
        "Fix: start Docker, or set TEST_DATABASE_URL to a reachable PostgreSQL instance.",
      ].join("\n"),
      { cause: error },
    );
  }
})();

beforeEach(async () => {
  if (!prismaInitialized) return;
  // Truncate all tables before each test to ensure isolation
  await truncateAllTables();
});

afterAll(async () => {
  // Disconnect Prisma client
  if (prismaInitialized) {
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
