import type { GenerateNormalizedImportFixtureOptions } from "./generateNormalizedImportFixture";

const DAY = 86_400_000;
export const PREVIEW_OPERATIONS = [
  "customer cancel",
  "customer rebook",
  "admin cancel",
  "admin rebook",
  "customer regular update",
  "admin regular update",
] as const;

function jstDate(date = new Date()): string {
  return new Date(date.getTime() + 9 * 3_600_000).toISOString().slice(0, 10);
}

export function shiftDate(value: string, days: number): string {
  return new Date(new Date(`${value}T00:00:00Z`).getTime() + days * DAY)
    .toISOString()
    .slice(0, 10);
}

function shiftMonth(value: string, months: number): string {
  const date = new Date(`${value}T00:00:00Z`);
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + months);
  const lastDay = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0),
  ).getUTCDate();
  date.setUTCDate(Math.min(day, lastDay));
  return date.toISOString().slice(0, 10);
}

function validDate(value: string): boolean {
  const date = new Date(`${value}T00:00:00Z`);
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

export function selectChangedCustomers<T>(
  customers: readonly T[],
  changes: number,
): T[] {
  if (
    !Number.isSafeInteger(changes) ||
    changes < 0 ||
    changes > Math.ceil(customers.length / 2)
  ) {
    throw new Error(
      `--changes must be an integer from 0 to ${Math.ceil(customers.length / 2)} (odd customer ordinals only)`,
    );
  }
  return customers.filter((_, index) => index % 2 === 0).slice(0, changes);
}

export function assertLocalPreviewEnvironment(env: NodeJS.ProcessEnv): void {
  if (env.EMAIL_ENV !== "develop")
    throw new Error("seed:preview requires EMAIL_ENV=develop");
  let url: URL;
  try {
    url = new URL(env.POSTGRES_PRISMA_URL ?? "");
  } catch {
    throw new Error("seed:preview requires a valid POSTGRES_PRISMA_URL");
  }
  if (
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
    [...url.searchParams.keys()].some((key) =>
      ["host", "hostaddr", "service"].includes(key.toLowerCase()),
    )
  ) {
    throw new Error(
      "seed:preview only resets a loopback PostgreSQL database (without connection-host overrides)",
    );
  }
}

export function parsePreviewOptions(
  argv: string[],
  now = new Date(),
): GenerateNormalizedImportFixtureOptions & {
  baseDate: string;
  changes: number;
  changesStart: Date;
  changesIntervalMinutes: number;
} {
  const flags = new Map<string, string>();
  const allowed = new Set([
    "from",
    "completed-until",
    "to",
    "instructors",
    "changes",
    "base-date",
    "changes-start",
    "changes-interval-minutes",
  ]);
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i].slice(2);
    const value = argv[i + 1];
    if (
      !argv[i].startsWith("--") ||
      !allowed.has(key) ||
      flags.has(key) ||
      !value ||
      value.startsWith("--")
    )
      throw new Error(`Invalid preview argument: ${argv[i]}`);
    flags.set(key, value);
  }
  const baseDate = flags.get("base-date") ?? jstDate(now);
  if (!validDate(baseDate))
    throw new Error("Invalid --base-date (expected YYYY-MM-DD)");
  const from = flags.get("from") ?? shiftMonth(baseDate, -3);
  const completedUntil =
    flags.get("completed-until") ?? shiftDate(baseDate, -1);
  const to = flags.get("to") ?? shiftMonth(baseDate, 7);
  if (
    ![from, completedUntil, to].every(validDate) ||
    from > completedUntil ||
    completedUntil > to
  )
    throw new Error(
      "Dates must be valid YYYY-MM-DD with from <= completed-until <= to",
    );
  const count = (key: string, fallback: number) => {
    const raw = flags.get(key);
    if (raw !== undefined && !/^\d+$/.test(raw))
      throw new Error(`Invalid --${key}`);
    const value = raw === undefined ? fallback : Number(raw);
    if (!Number.isSafeInteger(value)) throw new Error(`Invalid --${key}`);
    return value;
  };
  const instructorCount = count("instructors", 10);
  if (instructorCount < 2) throw new Error("--instructors must be at least 2");
  const changes = count("changes", 0);
  if (changes > instructorCount * 5)
    throw new Error(
      `--changes cannot exceed ${instructorCount * 5} odd customer ordinals`,
    );
  if (
    changes > 0 &&
    (baseDate < jstDate(now) ||
      completedUntil >= baseDate ||
      from > baseDate ||
      to < shiftDate(baseDate, 60))
  )
    throw new Error(
      "Changes require base-date >= today's JST date, from <= base-date, completed-until < base-date, and to >= base-date + 60 days",
    );
  const start = flags.get("changes-start") ?? `${baseDate}T00:00:00+09:00`;
  const changesStart = new Date(start);
  if (
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})$/.test(
      start,
    ) ||
    !Number.isFinite(changesStart.getTime()) ||
    !validDate(start.slice(0, 10))
  )
    throw new Error("--changes-start requires an ISO datetime with timezone");
  const changesIntervalMinutes = count("changes-interval-minutes", 1);
  if (
    changesIntervalMinutes < 1 ||
    !Number.isFinite(
      new Date(
        changesStart.getTime() +
          Math.max(0, changes * PREVIEW_OPERATIONS.length - 1) *
            changesIntervalMinutes *
            60_000,
      ).getTime(),
    )
  )
    throw new Error("Invalid --changes-interval-minutes");
  return {
    baseDate,
    from,
    completedUntil,
    to,
    instructorCount,
    changes,
    changesStart,
    changesIntervalMinutes,
  };
}
