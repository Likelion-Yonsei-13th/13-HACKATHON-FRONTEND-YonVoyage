// src/app/api/aistudio/generate/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";

const UPSTREAM_BASE =
  process.env.PIXPL_BASE?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ||
  "https://pixpl.com";

/**
 * 프론트 → /api/aistudio/generate → (프록시) → {UPSTREAM}/api/studio/generate/
 * Body(JSON): { uuid, prompt, uploaded_image_id? }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const upstream = await fetch(`${UPSTREAM_BASE}/api/studio/generate/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const text = await upstream.text().catch(() => "");
    if (!upstream.ok) {
      console.error("❌ 생성 프록시 실패:", upstream.status, text);
      return new NextResponse(text || `upstream ${upstream.status}`, {
        status: upstream.status,
      });
    }

    let data: any = text ? JSON.parse(text) : {};
    // url 정규화(후단이 상대경로만 줄 때 대비)
    const media = data?.url ?? data?.generated_image;
    if (typeof media === "string" && !/^https?:\/\//i.test(media)) {
      const MEDIA_BASE =
        process.env.MEDIA_BASE?.replace(/\/$/, "") || UPSTREAM_BASE;
      data.url = `${MEDIA_BASE}${media.startsWith("/") ? "" : "/"}${media}`;
    }

    console.log(
      "✅ 생성 프록시 완료:",
      upstream.status,
      `(${UPSTREAM_BASE}/api/studio/generate/)`
    );
    return NextResponse.json(data, { status: upstream.status });
  } catch (e: any) {
    console.error("[aistudio/generate] proxy error:", e?.message || e);
    return NextResponse.json(
      { error: `proxy error: ${e?.message || e}` },
      { status: 500 }
    );
  }
}
