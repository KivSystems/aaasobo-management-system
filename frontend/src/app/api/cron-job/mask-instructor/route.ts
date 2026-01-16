import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { maskInstructor } from "@/lib/api/instructorsApi";

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
    console.log("Cron job (maskInstructor) started");
    await maskInstructor(authorization); // Mask instructor information who has left the organization
    console.log("Cron job (maskInstructor) executed successfully.");
    return NextResponse.json(
      { message: "Cron job (maskInstructor) executed successfully." },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error during cron job (maskInstructor) execution:", error);
    return NextResponse.json(
      {
        error: "Cron job (maskInstructor) failed",
        details: (error as Error).message,
      },
      { status: 500 },
    );
  }
}
