// src/app/api/user/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";

const UPSTREAM_BASE =
  process.env.PIXPL_BASE?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ||
  "https://pixpl.com";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    // ✅ 명확히 /api/user/ 로만 프록시
    const upstream = await fetch(`${UPSTREAM_BASE}/api/user/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const text = await upstream.text().catch(() => "");
    if (!upstream.ok) {
      return new NextResponse(text || `upstream ${upstream.status}`, {
        status: upstream.status,
      });
    }

    let data: any = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }

    return NextResponse.json(data, { status: upstream.status });
  } catch (e: any) {
    console.error("[api/user] proxy error:", e);
    return NextResponse.json(
      { error: `proxy error: ${e?.message || e}` },
      { status: 500 }
    );
  }
}
