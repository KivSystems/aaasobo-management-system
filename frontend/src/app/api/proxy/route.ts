import { NextRequest } from "next/server";
import { getCookie } from "../../../middleware";

export async function GET(req: NextRequest) {
  // Get information from request headers
  const noCache = req.headers.get("no-cache") === "true";
  const revalidateTag = req.headers.get("revalidate-tag");
  const backendEndpoint = req.headers.get("backend-endpoint");
  const cookie = await getCookie();

  // Set fetch options
  const method = "GET";
  const backendApiURL = `${process.env.BACKEND_ORIGIN}${backendEndpoint}`;
  const headers = { "Content-Type": "application/json", Cookie: cookie };

  // Send fetch request to backend API
  const response = await fetch(backendApiURL, {
    method,
    headers,
    cache: noCache ? "no-store" : "default",
    next: revalidateTag ? { tags: [revalidateTag] } : undefined,
  });

  return response;
}

export async function POST(req: NextRequest) {
  // Get information from request headers
  const backendEndpoint = req.headers.get("backend-endpoint");
  const cookie = await getCookie();

  // Get body from the request
  const body = await req.json();

  // Set fetch options
  const method = "POST";
  const backendApiURL = `${process.env.BACKEND_ORIGIN}${backendEndpoint}`;
  const headers = { "Content-Type": "application/json", Cookie: cookie };

  // Send fetch request to backend API
  const response = await fetch(backendApiURL, {
    method,
    headers,
    body: JSON.stringify(body),
  });

  return response;
}

export async function PATCH(req: NextRequest) {
  // Get information from request headers
  const backendEndpoint = req.headers.get("backend-endpoint");
  const cookie = await getCookie();

  // Set fetch options
  const method = "PATCH";
  const backendApiURL = `${process.env.BACKEND_ORIGIN}${backendEndpoint}`;

  // Set up body and headers based on content type
  let body: any;
  let headers: Record<string, string> = { Cookie: cookie };
  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    body = await req.json();
    headers["Content-Type"] = "application/json";
  } else {
    body = await req.formData();
  }

  // Send fetch request to backend API
  const response = await fetch(backendApiURL, {
    method,
    headers,
    body: contentType.includes("application/json")
      ? JSON.stringify(body)
      : body,
  });

  return response;
}

export async function PUT(req: NextRequest) {
  // Get information from request headers
  const backendEndpoint = req.headers.get("backend-endpoint");
  const cookie = await getCookie();

  // Set fetch options
  const method = "PUT";
  const backendApiURL = `${process.env.BACKEND_ORIGIN}${backendEndpoint}`;

  // Set up body and headers based on content type
  let body: any;
  let headers: Record<string, string> = { Cookie: cookie };
  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    body = await req.json();
    headers["Content-Type"] = "application/json";
  } else {
    body = await req.formData();
  }

  // Send fetch request to backend API
  const response = await fetch(backendApiURL, {
    method,
    headers,
    body: contentType.includes("application/json")
      ? JSON.stringify(body)
      : body,
  });

  return response;
}

export async function DELETE(req: NextRequest) {
  // Get information from request headers
  const backendEndpoint = req.headers.get("backend-endpoint");
  const cookie = await getCookie();

  // Set fetch options
  const method = "DELETE";
  const backendApiURL = `${process.env.BACKEND_ORIGIN}${backendEndpoint}`;
  const headers = { "Content-Type": "application/json", Cookie: cookie };

  // Send fetch request to backend API
  const response = await fetch(backendApiURL, {
    method,
    headers,
  });

  return response;
}
