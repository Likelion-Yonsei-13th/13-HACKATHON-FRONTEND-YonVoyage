// src/app/api/studio/[id]/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";

const UPSTREAM_BASE =
  process.env.PIXPL_BASE?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ||
  "https://pixpl.com";

const MEDIA_BASE = process.env.MEDIA_BASE?.replace(/\/$/, "") || null;

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> } // Next 15: params는 Promise
) {
  const { id } = await ctx.params;

  const tryUrls = [
    `${UPSTREAM_BASE}/api/studio/${encodeURIComponent(id)}/`,
    `${UPSTREAM_BASE}/api/studio/generated/${encodeURIComponent(id)}/`,
  ];

  try {
    let lastText = "";
    for (const upstreamUrl of tryUrls) {
      const r = await fetch(upstreamUrl, { method: "GET", cache: "no-store" });

      if (r.ok) {
        const text = await r.text();
        let data: any;
        try {
          data = JSON.parse(text);
        } catch {
          data = { raw: text };
        }

        // 서버가 줄 수 있는 다양한 키에서 미디어 경로/URL 추출
        const rawMedia =
          data?.url ??
          data?.image_url ??
          data?.resultUrl ??
          data?.previewUrl ??
          data?.generated_image;

        // 최종적으로 data.url을 채워서 프론트가 항상 이 필드만 쓰게 함
        if (typeof rawMedia === "string" && rawMedia.length > 0) {
          let finalUrl = rawMedia;

          const isAbsolute = /^https?:\/\//i.test(rawMedia);

          if (!isAbsolute) {
            // 상대경로 → MEDIA_BASE 우선, 없으면 UPSTREAM_BASE로 절대화
            const base = MEDIA_BASE || UPSTREAM_BASE;
            finalUrl = `${base}${
              rawMedia.startsWith("/") ? "" : "/"
            }${rawMedia}`;
          } else if (MEDIA_BASE) {
            // 절대경로인데, 호스트가 UPSTREAM_BASE이고 /media/ 경로라면 MEDIA_BASE로 교체
            try {
              const u = new URL(rawMedia);
              const upstreamHost = new URL(UPSTREAM_BASE).host;
              if (u.host === upstreamHost && u.pathname.startsWith("/media/")) {
                const mediaOrigin = new URL(MEDIA_BASE);
                u.protocol = mediaOrigin.protocol;
                u.host = mediaOrigin.host;
                // mediaOrigin에 서브경로가 있다면(예: https://cdn.example.com/assets),
                // 그 경로를 prefix로 붙이고 싶다면 아래 한 줄을 조정하세요.
                // u.pathname = `${mediaOrigin.pathname.replace(/\/$/, "")}${u.pathname}`;
                finalUrl = u.toString();
              }
            } catch {
              // URL 파싱 실패 시 원본 유지
            }
          }

          data.url = finalUrl;
          // 디버그 로그
          console.log(
            "🖼️ resolved media URL:",
            finalUrl,
            "(raw:",
            rawMedia,
            "MEDIA_BASE:",
            MEDIA_BASE,
            ")"
          );
        }

        // 캐시 방지 헤더 포함하여 반환
        const res = NextResponse.json(data, { status: r.status });
        res.headers.set("Cache-Control", "no-store");
        console.log(`✅ GET studio OK (${upstreamUrl})`);
        return res;
      }

      // 404면 다음 후보로 폴백, 그 외 에러는 그대로 반환
      lastText = await r.text().catch(() => "");
      if (r.status !== 404) {
        const res = new NextResponse(lastText || `upstream ${r.status}`, {
          status: r.status,
        });
        res.headers.set("Cache-Control", "no-store");
        return res;
      }
    }

    const notFound = new NextResponse(lastText || "not found", { status: 404 });
    notFound.headers.set("Cache-Control", "no-store");
    return notFound;
  } catch (e: any) {
    console.error("[Proxy:get studio] error:", e?.message || e);
    const err = NextResponse.json(
      { error: `proxy error: ${e?.message || e}` },
      { status: 500 }
    );
    err.headers.set("Cache-Control", "no-store");
    return err;
  }
}
