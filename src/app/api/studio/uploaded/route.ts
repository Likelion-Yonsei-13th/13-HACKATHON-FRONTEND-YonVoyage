// src/app/api/studio/uploaded/route.ts
export const runtime = "nodejs";
import { NextResponse } from "next/server";

const UPSTREAM_BASE =
  process.env.PIXPL_BASE?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000";

// 업로드된 이미지 목록 조회 (명세: POST /api/studio/uploaded/)
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const payload = {
      uuid: body.uuid ?? body.user_uuid ?? "",
      user_uuid: body.uuid ?? body.user_uuid ?? "",
    };

    const upstream = await fetch(`${UPSTREAM_BASE}/api/studio/uploaded/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "Content-Type":
          upstream.headers.get("content-type") || "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: `proxy error: ${e?.message || e}` },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

// (선택) GET 폴백도 지원하면 405 방지
export async function GET(req: Request) {
  const url = new URL(req.url);
  const uuid = url.searchParams.get("uuid") ?? "";
  const upstream = await fetch(
    `${UPSTREAM_BASE}/api/studio/uploaded/?uuid=${encodeURIComponent(uuid)}`,
    { method: "GET", cache: "no-store" }
  );
  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      "Content-Type":
        upstream.headers.get("content-type") || "application/json",
      "Cache-Control": "no-store",
    },
  });
}
