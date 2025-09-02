// src/app/api/studio/generated/route.ts
export const runtime = "nodejs";
import { NextResponse } from "next/server";

const UPSTREAM_BASE =
  process.env.PIXPL_BASE?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000";

// 생성된 이미지 목록 조회 (명세: POST /api/studio/generated/)
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const payload = {
    uuid: body.uuid ?? body.user_uuid ?? "",
    user_uuid: body.uuid ?? body.user_uuid ?? "",
  };

  const upstream = await fetch(`${UPSTREAM_BASE}/api/studio/generated/`, {
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
}

// (선택) GET 폴백
export async function GET(req: Request) {
  const url = new URL(req.url);
  const uuid = url.searchParams.get("uuid") ?? "";
  const upstream = await fetch(
    `${UPSTREAM_BASE}/api/studio/generated/?uuid=${encodeURIComponent(uuid)}`,
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
