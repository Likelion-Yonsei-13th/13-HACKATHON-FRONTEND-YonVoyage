// src/app/api/studio/upload/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";

const UPSTREAM_BASE =
  process.env.PIXPL_BASE?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ||
  "https://pixpl.com"; // 기본값

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    const fd = new FormData();
    fd.append("file", file, (file as any).name ?? "upload.bin");

    const upstreamUrl = `${UPSTREAM_BASE}/api/studio/upload/`; // ✅ 요구한 엔드포인트
    const headers = process.env.BACKEND_API_KEY
      ? { Authorization: `Bearer ${process.env.BACKEND_API_KEY}` }
      : undefined;

    const upstream = await fetch(upstreamUrl, {
      method: "POST",
      body: fd,
      headers,
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
      `✅ 업로드 프록시 완료: ${upstream.status} ${upstream.statusText} (${upstreamUrl})`
    );

    return NextResponse.json(data, { status: upstream.status });
  } catch (e: any) {
    console.error("[Proxy:upload] error:", e?.message || e);
    return NextResponse.json(
      { error: `proxy error: ${e?.message || e}` },
      { status: 500 }
    );
  }
}
