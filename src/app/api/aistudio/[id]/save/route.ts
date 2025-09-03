// src/app/api/aistudio/[id]/save/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";

const UPSTREAM_BASE =
  process.env.PIXPL_BASE?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ||
  "https://pixpl.com";

// ⚠️ 두 번째 인자 타입 주석 삭제(중요)
export async function POST(_req: Request, ctx: any) {
  try {
    const id = encodeURIComponent(String(ctx?.params?.id ?? ""));

    // ✅ 백엔드 실제 명세로 중계: POST /api/studio/{generated_image_id}/save
    let upstream = await fetch(`${UPSTREAM_BASE}/api/studio/${id}/save`, {
      method: "POST",
      cache: "no-store",
    });

    // 서버에 따라 트레일링 슬래시 필요할 수도 있어 폴백 1회
    if (!upstream.ok && upstream.status === 404) {
      upstream = await fetch(`${UPSTREAM_BASE}/api/studio/${id}/save/`, {
        method: "POST",
        cache: "no-store",
      });
    }

    const text = await upstream.text().catch(() => "");
    if (!upstream.ok) {
      return new NextResponse(text || `upstream ${upstream.status}`, {
        status: upstream.status,
      });
    }

    try {
      return NextResponse.json(JSON.parse(text), { status: upstream.status });
    } catch {
      return new NextResponse(text || "ok", { status: upstream.status });
    }
  } catch (e: any) {
    console.error("[aistudio/:id/save] proxy error:", e?.message || e);
    return NextResponse.json(
      { error: `proxy error: ${e?.message || e}` },
      { status: 500 }
    );
  }
}
