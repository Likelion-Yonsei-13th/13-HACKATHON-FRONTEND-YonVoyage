// src/app/api/aistudio/upload/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";

const UPSTREAM_BASE =
  process.env.PIXPL_BASE?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ||
  "https://pixpl.com";

/**
 * 프론트 → /api/aistudio/upload → (프록시) → {UPSTREAM}/api/studio/upload/
 * Body: multipart/form-data (file[, uuid])
 */
export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const uuid = form.get("uuid") as string | null; // 선택

    if (!file) {
      return NextResponse.json({ error: "file required" }, { status: 400 });
    }

    const fd = new FormData();
    fd.append("file", file, (file as any).name ?? "upload");
    if (uuid) fd.append("uuid", uuid);

    const upstream = await fetch(`${UPSTREAM_BASE}/api/studio/upload/`, {
      method: "POST",
      body: fd,
      // 헤더는 FormData일 때 자동 boundary 셋업이 안전
    });

    const text = await upstream.text().catch(() => "");
    if (!upstream.ok) {
      console.error("❌ 업로드 프록시 실패:", upstream.status, text);
      return new NextResponse(text || `upstream ${upstream.status}`, {
        status: upstream.status,
      });
    }

    const data = text ? JSON.parse(text) : {};
    console.log("✅ 업로드 프록시 완료:", upstream.status);
    return NextResponse.json(data, { status: upstream.status });
  } catch (e: any) {
    console.error("[aistudio/upload] proxy error:", e?.message || e);
    return NextResponse.json(
      { error: `proxy error: ${e?.message || e}` },
      { status: 500 }
    );
  }
}
