import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
export async function GET(req: NextRequest) {
  const authorization = req.headers.get("Authorization");
  if (
    !process.env.CRON_SECRET ||
    authorization !== `Bearer ${process.env.CRON_SECRET}`
  )
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://localhost:4000"}/jobs/class-change-history`,
      {
        method: "POST",
        headers: { Authorization: authorization },
        cache: "no-store",
      },
    );
    if (!response.ok)
      throw new Error(`Class change history job failed: ${response.status}`);
    return NextResponse.json({ message: "Class change history job completed" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Class change history job failed" },
      { status: 500 },
    );
  }
}
