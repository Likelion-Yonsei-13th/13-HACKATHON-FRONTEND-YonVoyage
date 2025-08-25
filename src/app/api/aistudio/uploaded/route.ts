// src/app/api/aistudio/uploaded/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";

const UPSTREAM_BASE =
  process.env.PIXPL_BASE?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ||
  "https://pixpl.com";

/** 목록(업로드 원본) */
export async function GET(req: Request) {
  const u = new URL(req.url);
  const uuid = u.searchParams.get("uuid");
  const q = uuid ? `?uuid=${encodeURIComponent(uuid)}` : "";

  try {
    const upstream = await fetch(`${UPSTREAM_BASE}/api/studio/uploaded/${q}`, {
      cache: "no-store",
    });
    const text = await upstream.text().catch(() => "");
    if (!upstream.ok) {
      return new NextResponse(text || `upstream ${upstream.status}`, {
        status: upstream.status,
      });
    }
    let list = text ? JSON.parse(text) : [];
    // 각 item.url 정규화
    const MEDIA_BASE =
      process.env.MEDIA_BASE?.replace(/\/$/, "") || UPSTREAM_BASE;
    list = (Array.isArray(list) ? list : []).map((it: any) => {
      const media = it?.url ?? it?.uploaded_image;
      if (typeof media === "string" && !/^https?:\/\//i.test(media)) {
        it.url = `${MEDIA_BASE}${media.startsWith("/") ? "" : "/"}${media}`;
      }
      return it;
    });
    return NextResponse.json(list, { status: 200 });
  } catch (e: any) {
    console.error("[aistudio/uploaded] proxy error:", e?.message || e);
    return NextResponse.json(
      { error: `proxy error: ${e?.message || e}` },
      { status: 500 }
    );
  }
}
