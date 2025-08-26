import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSundayColor } from "@/app/helper/api/calendarsApi";
import {
  createInstructorPostTerminationSchedule,
  maskInstructors,
} from "@/app/helper/api/instructorsApi";
import { deleteOldClasses } from "@/app/helper/api/classesApi";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  // Get the authorization header
  const authorization = req.headers.get("Authorization");

  if (
    !authorization ||
    req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("Cron job (updateSundayColor) started");
    await updateSundayColor(authorization); // Update next year's all Sunday's color of business calendar
    // TODO: Move the following functions to each cron job after upgrading Vercel plan
    await maskInstructors(authorization); // Mask instructor information who has left the organization
    await deleteOldClasses(authorization); // Delete classes older than 1 year (13 months)
    await createInstructorPostTerminationSchedule(authorization); // Create post-termination schedules for instructors who have left the organization
    console.log("Cron job (updateSundayColor) executed successfully");
    return NextResponse.json(
      { message: "Cron job (updateSundayColor) executed successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "Error during cron job (updateSundayColor) execution:",
      error,
    );
    return NextResponse.json(
      {
        error: "Cron job (updateSundayColor) failed",
        details: (error as Error).message,
      },
      { status: 500 },
    );
  }
}
