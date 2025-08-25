// src/app/api/proxy-image/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("u");
  if (!url) {
    return new NextResponse("missing u", { status: 400 });
  }

  try {
    const upstream = await fetch(url, {
      cache: "no-store",
      referrerPolicy: "no-referrer",
      headers: {
        "Accept-Encoding": "gzip, deflate",
      },
    });

    if (!upstream.ok) {
      const body = await upstream.text().catch(() => "");
      console.error(`Upstream fetch failed: ${upstream.status}, Body: ${body}`);
      return new NextResponse(`upstream ${upstream.status}: ${body}`, {
        status: 502,
      });
    }

    const headers = new Headers();
    const ct = upstream.headers.get("content-type");
    const cl = upstream.headers.get("content-length");
    if (ct) headers.set("Content-Type", ct);
    if (cl) headers.set("Content-Length", cl);

    // ✅ 등록 완료 로그 추가
    console.log(`✅ Proxy fetch 성공! URL: ${url}`);

    return new NextResponse(upstream.body, { status: 200, headers });
  } catch (e: any) {
    console.error(`Proxy error: ${e.message}`);
    return new NextResponse(`proxy error: ${e.message}`, { status: 500 });
  }
}
