import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSundayColor } from "@/app/helper/api/calendarsApi";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  if (
    req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("Cron job (data processing) started");
    // === Add cron job ===
    await updateSundayColor(); // Update next year's all Sunday's color of business calendar
    // === End of cron job ===
    console.log("All cron jobs (data processing) executed successfully");
    return NextResponse.json(
      { message: "All cron jobs (data processing) executed successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error during cron job (data processing) execution:", error);
    return NextResponse.json(
      {
        error: "Cron job (data processing) failed",
        details: (error as Error).message,
      },
      { status: 500 },
    );
  }
}
