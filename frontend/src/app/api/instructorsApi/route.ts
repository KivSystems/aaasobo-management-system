import { NextRequest, NextResponse } from "next/server";
import { getCookie } from "../../../middleware";

export async function GET(req: NextRequest) {
  // Get instruction from request headers
  const noCache = req.headers.get("no-cache") === "true";
  const revalidateTag = req.headers.get("revalidate-tag");
  const backendEndpoint = req.headers.get("backend-endpoint");

  // Get the cookies from the request headers
  const cookie = await getCookie();

  // Set fetch options
  const method = "GET";
  const backendApiURL = `${process.env.BACKEND_ORIGIN}${backendEndpoint}`;
  const headers = { "Content-Type": "application/json", Cookie: cookie };

  // Make fetch request to backend API
  const response = await fetch(backendApiURL, {
    method,
    headers,
    cache: noCache ? "no-store" : "default",
    next: revalidateTag ? { tags: [revalidateTag] } : undefined,
  });

  const data = await response.json();
  return NextResponse.json(data);
}
