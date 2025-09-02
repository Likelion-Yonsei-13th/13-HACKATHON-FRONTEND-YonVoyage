// src/app/api/proxy-image/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

const MEDIA_BASE = process.env.MEDIA_BASE?.replace(/\/$/, "") || "";
const UPSTREAM_BASE =
  process.env.PIXPL_BASE?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ||
  "";
const BACKEND_ORIGIN_FOR_PROXY =
  process.env.BACKEND_ORIGIN_FOR_PROXY?.replace(/\/$/, "") || "";

/** u 파라미터를 안전하게 절대 URL로 변환 */
function resolveTarget(uRaw: string): string {
  let u = uRaw;
  try {
    u = decodeURIComponent(uRaw);
  } catch {
    // noop
  }

  // 절대 URL이 아니면 MEDIA_BASE > UPSTREAM_BASE 기준으로 절대화
  if (!/^https?:\/\//i.test(u)) {
    const base = MEDIA_BASE || UPSTREAM_BASE;
    if (!base) {
      throw new Error("no base configured for relative URL");
    }
    u = `${base}${u.startsWith("/") ? "" : "/"}${u}`;
  }

  // 127.0.0.1/localhost → 컨테이너 내 접근 가능한 호스트로 치환
  try {
    const url = new URL(u);
    if (
      BACKEND_ORIGIN_FOR_PROXY &&
      (url.hostname === "127.0.0.1" || url.hostname === "localhost")
    ) {
      const base = new URL(BACKEND_ORIGIN_FOR_PROXY);
      url.protocol = base.protocol;
      url.host = base.host; // host:port
      u = url.toString();
    }
  } catch {
    // noop
  }

  return u;
}

export async function GET(req: NextRequest) {
  const src = req.nextUrl.searchParams.get("u");
  if (!src) {
    return new NextResponse("missing u", { status: 400 });
  }

  let target: string;
  try {
    target = resolveTarget(src);
  } catch (e: any) {
    return new NextResponse(`bad url: ${e?.message || "resolve failed"}`, {
      status: 400,
    });
  }

  // (옵션) 허용 도메인 화이트리스트
  try {
    const allowEnv = process.env.PROXY_IMAGE_ALLOW || "";
    const allow = allowEnv
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (allow.length) {
      const host = new URL(target).host;
      if (!allow.includes(host)) {
        return new NextResponse("forbidden host", { status: 403 });
      }
    }
  } catch {
    // noop
  }

  // Range 전달(스트리밍/시킹 대응)
  const fwdHeaders: Record<string, string> = {};
  const range = req.headers.get("range");
  if (range) fwdHeaders["range"] = range;

  try {
    const upstream = await fetch(target, {
      method: "GET",
      headers: fwdHeaders,
      cache: "no-store",
      redirect: "follow",
    });

    if (!upstream.ok) {
      const body = await upstream.text().catch(() => "");
      console.error(
        `Upstream fetch failed ${upstream.status} ${
          upstream.statusText
        } for ${target}: ${body?.slice(0, 400)}`
      );
      return new NextResponse(body || `upstream ${upstream.status}`, {
        status: upstream.status,
        headers: { "Cache-Control": "no-store" },
      });
    }

    const respHeaders = new Headers();
    respHeaders.set(
      "Content-Type",
      upstream.headers.get("content-type") || "image/*"
    );
    const cl = upstream.headers.get("content-length");
    if (cl) respHeaders.set("Content-Length", cl);
    const cd = upstream.headers.get("content-disposition");
    if (cd) respHeaders.set("Content-Disposition", cd);
    const etag = upstream.headers.get("etag");
    if (etag) respHeaders.set("ETag", etag);
    const lm = upstream.headers.get("last-modified");
    if (lm) respHeaders.set("Last-Modified", lm);
    respHeaders.set(
      "Accept-Ranges",
      upstream.headers.get("accept-ranges") || "bytes"
    );
    respHeaders.set("Cache-Control", "no-store");

    console.log(`✅ proxy-image OK -> ${target}`);
    return new NextResponse(upstream.body, {
      status: upstream.status, // 200/206 등 그대로 전달
      headers: respHeaders,
    });
  } catch (e: any) {
    console.error(`Proxy error for ${src}: ${e?.message || e}`);
    return new NextResponse(`proxy error: ${e?.message || e}`, { status: 500 });
  }
}
