import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSystemStatus } from "@/app/helper/api/maintenanceApi";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  if (
    req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("Cron job (system status update) started");
    const status = await updateSystemStatus(); // Update system status
    console.log("Cron job (system status update) executed successfully");
    console.log("System status updated to:", status);
    return NextResponse.json(
      {
        message: "Cron job (system status update) executed successfully",
        status,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "Error during cron job (system status update) execution:",
      error,
    );
    return NextResponse.json(
      {
        error: "Cron job (system status update) failed",
        details: (error as Error).message,
      },
      { status: 500 },
    );
  }
}
