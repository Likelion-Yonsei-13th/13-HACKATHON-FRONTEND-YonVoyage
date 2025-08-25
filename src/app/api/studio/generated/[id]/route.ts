// src/app/api/studio/generated/[id]/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";

const UPSTREAM_BASE =
  process.env.PIXPL_BASE?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ||
  "https://pixpl.com";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const upstreamUrl = `${UPSTREAM_BASE}/api/studio/generated/${encodeURIComponent(
      id
    )}/`;

    const headers = process.env.BACKEND_API_KEY
      ? { Authorization: `Bearer ${process.env.BACKEND_API_KEY}` }
      : undefined;

    const upstream = await fetch(upstreamUrl, {
      method: "GET",
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

    // url이 상대경로로 오면 절대경로로 보정
    if (data && typeof data === "object") {
      const pickUrl =
        data.url ||
        data.image_url ||
        data.resultUrl ||
        data.previewUrl ||
        data.generated_image;

      if (typeof pickUrl === "string" && !/^https?:\/\//i.test(pickUrl)) {
        data.url = `${UPSTREAM_BASE}${
          pickUrl.startsWith("/") ? "" : "/"
        }${pickUrl}`;
      }
    }

    console.log(
      `✅ 결과조회 프록시 완료: ${upstream.status} ${upstream.statusText} (${upstreamUrl})`
    );

    return NextResponse.json(data, { status: upstream.status });
  } catch (e: any) {
    console.error("[Proxy:getGenerated] error:", e?.message || e);
    return NextResponse.json(
      { error: `proxy error: ${e?.message || e}` },
      { status: 500 }
    );
  }
}
