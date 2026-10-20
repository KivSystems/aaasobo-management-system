import { describe, expect, it } from "vitest";
import {
  assertLocalPreviewEnvironment,
  parsePreviewOptions,
  PREVIEW_OPERATIONS,
  selectChangedCustomers,
} from "../../seed/previewFixtureOptions";

const now = new Date("2026-10-18T18:00:00Z");
describe("local preview fixture planning", () => {
  it("selects N complete sets on one-based odd ordinals in generator order", () => {
    const customers = Array.from(
      { length: 100 },
      (_, index) => `CU${index + 1}`,
    );
    expect(selectChangedCustomers(customers, 3)).toEqual(["CU1", "CU3", "CU5"]);
    const selected = selectChangedCustomers(customers, 50);
    expect(selected).toHaveLength(50);
    expect(
      selected.every((customer) => Number(customer.slice(2)) % 2 === 1),
    ).toBe(true);
    expect(selected.length * PREVIEW_OPERATIONS.length).toBe(300);
    expect(selectChangedCustomers(customers, 0)).toEqual([]);
    expect(() => selectChangedCustomers(customers, 51)).toThrow("0 to 50");
    expect(() => selectChangedCustomers(customers, -1)).toThrow();
    expect(() => selectChangedCustomers(customers, 1.5)).toThrow();
  });
  it("uses current JST and a stable explicit base date with three past/seven future months", () => {
    expect(parsePreviewOptions([], now)).toEqual({
      baseDate: "2026-10-19",
      from: "2026-07-19",
      completedUntil: "2026-10-18",
      to: "2027-05-19",
      instructorCount: 10,
      changes: 0,
      changesStart: new Date("2026-10-19T00:00:00+09:00"),
      changesIntervalMinutes: 1,
    });
    const argv = ["--base-date", "2026-10-31", "--changes", "10"];
    expect(parsePreviewOptions(argv, now)).toEqual(
      parsePreviewOptions(argv, new Date("2026-10-20T00:00:00Z")),
    );
    expect(parsePreviewOptions(["--base-date", "2026-08-31"], now).to).toBe(
      "2027-03-31",
    );
  });
  it("accepts explicit operation timing and rejects ambiguous or invalid timing", () => {
    const options = parsePreviewOptions(
      [
        "--changes-start",
        "2026-10-12T09:00:00+09:00",
        "--changes-interval-minutes",
        "30",
      ],
      now,
    );
    expect(options.changesStart.toISOString()).toBe("2026-10-12T00:00:00.000Z");
    expect(options.changesIntervalMinutes).toBe(30);
    for (const args of [
      ["--changes-start", "2026-10-12T09:00:00"],
      ["--changes-start", "2026-02-30T09:00:00+09:00"],
      ["--changes-interval-minutes", "0"],
      ["--changes-interval-minutes", "1.5"],
    ])
      expect(() => parsePreviewOptions(args, now)).toThrow();
  });
  it("rejects unsafe or impossible settings before import", () => {
    for (const argv of [
      ["--changes", "51"],
      ["--changes", "-1"],
      ["--instructors", "1"],
      ["--base-date", "2026-02-30"],
      ["--changes", "1", "--to", "2026-11-01"],
      ["--changes", "1", "--base-date", "2026-10-18"],
      ["--unknown", "1"],
      ["--changes"],
      ["--changes", "1", "--changes", "2"],
    ])
      expect(() => parsePreviewOptions(argv, now)).toThrow();
  });
  it("requires develop email routing and a loopback PostgreSQL connection without host overrides", () => {
    for (const host of ["localhost", "127.0.0.1", "[::1]"])
      expect(() =>
        assertLocalPreviewEnvironment({
          EMAIL_ENV: "develop",
          POSTGRES_PRISMA_URL: `postgresql://preview:preview@${host}:55496/demo`,
        }),
      ).not.toThrow();
    for (const env of [
      {
        EMAIL_ENV: "production",
        POSTGRES_PRISMA_URL: "postgresql://localhost/demo",
      },
      {
        EMAIL_ENV: "develop",
        POSTGRES_PRISMA_URL: "postgresql://db.example.com/demo",
      },
      {
        EMAIL_ENV: "develop",
        POSTGRES_PRISMA_URL: "postgresql://localhost/demo?host=remote",
      },
      {
        EMAIL_ENV: "develop",
        POSTGRES_PRISMA_URL: "postgresql://localhost/demo?hostaddr=1.2.3.4",
      },
      { EMAIL_ENV: "develop", POSTGRES_PRISMA_URL: "invalid" },
    ])
      expect(() => assertLocalPreviewEnvironment(env)).toThrow();
  });
});
