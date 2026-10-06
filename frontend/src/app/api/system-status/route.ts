import { getSystemStatus } from "@/lib/api/maintenanceApi";

export async function GET() {
  const status = await getSystemStatus();
  const headers = { "Cache-Control": "no-store" };

  if (status !== "Running" && status !== "Stop") {
    return Response.json(
      { error: "System status unavailable" },
      { status: 503, headers },
    );
  }

  return Response.json({ status }, { headers });
}
