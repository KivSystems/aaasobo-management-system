import { describe, expect, it } from "vitest";
import { prisma } from "../setup";
import { createInstructor } from "../testUtils";

describe("instructor birthday schema", () => {
  it("stores instructor month/day while retaining full child birthdates", async () => {
    const columns = await prisma.$queryRaw<
      Array<{
        table_name: string;
        data_type: string;
        character_maximum_length: number | null;
      }>
    >`
      SELECT table_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_schema = 'public' AND column_name = 'birthdate'
        AND table_name IN ('Instructor', 'Child') ORDER BY table_name`;
    expect(columns).toEqual([
      {
        table_name: "Child",
        data_type: "timestamp without time zone",
        character_maximum_length: null,
      },
      {
        table_name: "Instructor",
        data_type: "character varying",
        character_maximum_length: 5,
      },
    ]);
    const instructor = await createInstructor();
    const saved = await prisma.instructor.update({
      where: { id: instructor.id },
      data: { birthdate: "02-29" },
    });
    expect(saved.birthdate).toBe("02-29");
  });

  it("rejects impossible month/day values even when bypassing the API", async () => {
    const instructor = await createInstructor();
    await expect(
      prisma.instructor.update({
        where: { id: instructor.id },
        data: { birthdate: "04-31" },
      }),
    ).rejects.toThrow(/Instructor_birthdate_month_day_check/);
  });
});
