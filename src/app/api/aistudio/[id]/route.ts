// src/app/api/aistudio/[id]/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";

const UPSTREAM_BASE =
  process.env.PIXPL_BASE?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ||
  "https://pixpl.com";

/**
 * GET  /api/aistudio/{id}        → 조회(폴백: /api/studio/{id}/, /api/studio/generated/{id}/)
 * POST /api/aistudio/{id}/save   → 저장 프록시
 */

// Next 15 동적 API: params를 await
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  const candidates = [
    `${UPSTREAM_BASE}/api/studio/${encodeURIComponent(id)}/`,
    `${UPSTREAM_BASE}/api/studio/generated/${encodeURIComponent(id)}/`,
  ];

  try {
    let lastText = "";
    for (const url of candidates) {
      const r = await fetch(url, { cache: "no-store" });
      const text = await r.text().catch(() => "");
      if (r.ok) {
        let data: any;
        try {
          data = JSON.parse(text);
        } catch {
          data = {};
        }

        const media =
          data?.url ??
          data?.image_url ??
          data?.resultUrl ??
          data?.previewUrl ??
          data?.generated_image;

        if (typeof media === "string" && !/^https?:\/\//i.test(media)) {
          const MEDIA_BASE =
            process.env.MEDIA_BASE?.replace(/\/$/, "") || UPSTREAM_BASE;
          data.url = `${MEDIA_BASE}${media.startsWith("/") ? "" : "/"}${media}`;
          console.log(
            `🖼️ resolved media URL: ${data.url} (raw: ${media} MEDIA_BASE: ${MEDIA_BASE} )`
          );
        }

        console.log(`✅ GET aistudio OK (${url})`);
        return NextResponse.json(data, { status: r.status });
      }
      lastText = text;
      if (r.status !== 404) {
        return new NextResponse(lastText || `upstream ${r.status}`, {
          status: r.status,
        });
      }
    }
    return new NextResponse(lastText || "not found", { status: 404 });
  } catch (e: any) {
    console.error("[aistudio/{id}] proxy error:", e?.message || e);
    return NextResponse.json(
      { error: `proxy error: ${e?.message || e}` },
      { status: 500 }
    );
  }
}

// 저장 엔드포인트 프록시
export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  try {
    const upstream = await fetch(
      `${UPSTREAM_BASE}/api/studio/${encodeURIComponent(id)}/save`,
      { method: "POST" }
    );
    const text = await upstream.text().catch(() => "");
    if (!upstream.ok) {
      return new NextResponse(text || `upstream ${upstream.status}`, {
        status: upstream.status,
      });
    }
    return new NextResponse(text, { status: upstream.status });
  } catch (e: any) {
    console.error("[aistudio/{id}/save] proxy error:", e?.message || e);
    return NextResponse.json(
      { error: `proxy error: ${e?.message || e}` },
      { status: 500 }
    );
  }
}
