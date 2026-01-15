import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
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
    console.log("Cron job (deleteOldClasses) started");
    await deleteOldClasses(authorization); // Delete classes older than 1 year (13 months)
    console.log("Cron job (deleteOldClasses) executed successfully.");
    return NextResponse.json(
      { message: "Cron job (deleteOldClasses) executed successfully." },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error during cron job (deleteOldClasses) execution:", error);
    return NextResponse.json(
      {
        error: "Cron job (deleteOldClasses) failed",
        details: (error as Error).message,
      },
      { status: 500 },
    );
  }
}
