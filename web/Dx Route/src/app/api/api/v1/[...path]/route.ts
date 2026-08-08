import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-static";

export function generateStaticParams() {
  return [];
}

const MUAPI_BASE = "https://api.muapi.ai";

function getApiKey(request: NextRequest) {
  const headerKey = request.headers.get("x-api-key");
  if (headerKey) return headerKey;
  const cookieKey = request.cookies.get("muapi_key")?.value;
  return cookieKey;
}

function cleanHeaders(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.delete("cookie");
  headers.delete("content-length");
  return headers;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> },
) {
  try {
    const slug = await params;
    const path = (slug.path || []).join("/");
    const { search } = new URL(request.url);
    const targetUrl = `${MUAPI_BASE}/api/v1/${path}${search}`;
    const headers = cleanHeaders(request);
    const apiKey = getApiKey(request);
    if (apiKey) headers.set("x-api-key", apiKey);
    const response = await fetch(targetUrl, { headers, method: "GET" });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> },
) {
  try {
    const slug = await params;
    const path = (slug.path || []).join("/");
    const { search } = new URL(request.url);
    const targetUrl = `${MUAPI_BASE}/api/v1/${path}${search}`;
    const headers = cleanHeaders(request);
    const apiKey = getApiKey(request);
    if (apiKey) headers.set("x-api-key", apiKey);
    const body = await request.arrayBuffer();
    const response = await fetch(targetUrl, {
      method: "POST",
      headers,
      body,
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
