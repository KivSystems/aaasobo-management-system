import { afterAll, beforeEach, inject } from "vitest";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import {
  asAdminDatabaseUrl,
  quotedIdentifier,
  requireSafeDbName,
} from "./testDatabase";

const { faker } = require("@faker-js/faker");

let prisma!: PrismaClient;
let prismaInitialized = false;

// IMPORTANT: this module runs before each test file is evaluated.
// We initialize the DB connection at module load time so that any modules
// imported by the tests (e.g. `server`, which imports `prismaClient`) see the
// correct connection string immediately.
await (async () => {
  try {
    const baseDatabaseUrl = inject("baseDatabaseUrl");

    const workerId =
      process.env.VITEST_WORKER_ID ?? process.env.VITEST_POOL_ID ?? "0";
    const workerDbName = `aaasobo_test_${workerId}`;
    requireSafeDbName(workerDbName);

    const workerDatabaseUrl = withDatabase(baseDatabaseUrl, workerDbName);
    process.env.DATABASE_URL = workerDatabaseUrl;
    process.env.POSTGRES_PRISMA_URL = workerDatabaseUrl;

    await ensureDatabaseExists(baseDatabaseUrl, workerDbName);

    // Initialize Prisma client (engineType="client" requires a driver adapter)
    const adapter = new PrismaPg({
      connectionString: process.env.POSTGRES_PRISMA_URL,
    });
    prisma = new PrismaClient({ adapter });

    execSync("npx prisma migrate deploy", {
      stdio: "inherit",
      env: {
        ...process.env,
        POSTGRES_URL_NON_POOLING: workerDatabaseUrl,
        DATABASE_URL_UNPOOLED: workerDatabaseUrl,
      },
    });

    // Connect Prisma client
    await prisma.$connect();
    prismaInitialized = true;

    // Set consistent seed for reproducible test data
    faker.seed(12345);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      [
        "Test database setup failed.",
        message,
        "Fix: start Docker, or set TEST_DATABASE_URL to a reachable PostgreSQL instance.",
        "Note: the configured DB user must be able to create/drop databases for parallel tests.",
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
  }
});

async function truncateAllTables() {
  const tables = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const names = tables
    .filter(({ tablename }) => tablename !== "_prisma_migrations")
    .map(({ tablename }) => '"' + tablename.replaceAll('"', '""') + '"');
  if (names.length) {
    await prisma.$executeRawUnsafe(
      `TRUNCATE TABLE ${names.join(", ")} CASCADE`,
    );
  }
}

function withDatabase(databaseUrl: string, databaseName: string) {
  requireSafeDbName(databaseName);
  const url = new URL(databaseUrl);
  url.pathname = `/${databaseName}`;
  return url.toString();
}

async function ensureDatabaseExists(baseDatabaseUrl: string, dbName: string) {
  requireSafeDbName(dbName);
  const adminUrl = asAdminDatabaseUrl(baseDatabaseUrl);
  const adapter = new PrismaPg({ connectionString: adminUrl });
  const adminPrisma = new PrismaClient({ adapter });
  await adminPrisma.$connect();
  try {
    const rows = await adminPrisma.$queryRaw<Array<{ exists: number }>>`
      SELECT 1 as exists FROM pg_database WHERE datname = ${dbName}
    `;
    if (rows.length > 0) return;
    await adminPrisma.$executeRawUnsafe(
      `CREATE DATABASE ${quotedIdentifier(dbName)}`,
    );
  } finally {
    await adminPrisma.$disconnect();
  }
}

// Export prisma instance for use in tests
export { prisma };
