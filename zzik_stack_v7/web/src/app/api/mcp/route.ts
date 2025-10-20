import { NextRequest, NextResponse } from "next/server";
import { tfetch } from "@/lib/tfetch";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SERVICE_URL = process.env.MCP_SERVICE_URL;
const BASIC_AUTH = process.env.MCP_BASIC_AUTH;
const MCP_TIMEOUT = Number(process.env.MCP_TIMEOUT || 8000);

const buildHeaders = () => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (BASIC_AUTH) {
    const encoded = Buffer.from(BASIC_AUTH).toString("base64");
    headers.Authorization = `Basic ${encoded}`;
  }

  return headers;
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function POST(request: NextRequest) {
  if (!SERVICE_URL) {
    return NextResponse.json(
      { error: "MCP_SERVICE_URL not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await request.text();

    const result = await tfetch(SERVICE_URL, {
      method: "POST",
      headers: buildHeaders(),
      body,
      timeout: MCP_TIMEOUT,
    });

    if (result.status !== 'success' || !result.data) {
      const errorMessage = result.error?.message || 'MCP service request failed';
      return NextResponse.json({ error: errorMessage }, { status: 502 });
    }

    // result.data contains the already parsed response
    const responseText = typeof result.data === 'string' ? result.data : JSON.stringify(result.data);

    return new NextResponse(responseText, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
