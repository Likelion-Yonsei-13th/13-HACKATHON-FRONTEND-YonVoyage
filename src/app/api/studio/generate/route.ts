// src/app/api/studio/generate/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";

const UPSTREAM_BASE =
  process.env.PIXPL_BASE?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ||
  "https://pixpl.com";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const upstreamUrl = `${UPSTREAM_BASE}/api/studio/generate/`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (process.env.BACKEND_API_KEY) {
      headers.Authorization = `Bearer ${process.env.BACKEND_API_KEY}`;
    }

    const upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const text = await upstream.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    console.log(
      `✅ 생성 프록시 완료: ${upstream.status} ${upstream.statusText} (${upstreamUrl})`
    );

    return NextResponse.json(data, { status: upstream.status });
  } catch (e: any) {
    console.error("[Proxy:generate] error:", e?.message || e);
    return NextResponse.json(
      { error: `proxy error: ${e?.message || e}` },
      { status: 500 }
    );
  }
}
