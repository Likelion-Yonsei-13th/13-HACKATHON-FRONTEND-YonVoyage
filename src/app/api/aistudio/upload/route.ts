// src/app/api/studio/upload/route.ts
export const runtime = "nodejs";
import { NextResponse } from "next/server";

const UPSTREAM_BASE =
  process.env.PIXPL_BASE?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ||
  "https://pixpl.com";

export async function POST(req: Request) {
  try {
    const inFd = await req.formData();
    const file = inFd.get("image");
    // 명세: 온보딩은 uuid 없음 / 로그인은 uuid 포함
    const uuid = inFd.get("uuid");
    const outFd = new FormData();

    if (file instanceof File) outFd.append("image", file, file.name);
    if (typeof uuid === "string" && uuid.trim()) {
      outFd.append("uuid", uuid.trim());
    }

    // ✅ 업스트림 엔드포인트를 명세대로 변경
    const upstream = await fetch(`${UPSTREAM_BASE}/api/images/upload/`, {
      method: "POST",
      body: outFd, // content-type은 fetch가 자동 설정
    });

    const text = await upstream.text().catch(() => "");
    if (!upstream.ok) {
      console.error(
        "❌ 업로드 프록시 실패:",
        upstream.status,
        text?.slice(0, 500)
      );
      return new NextResponse(text || `upstream ${upstream.status}`, {
        status: upstream.status,
      });
    }

    let data: any = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }

    // 응답 URL 보정(선택)
    const media =
      data?.url ?? data?.image ?? data?.image_url ?? data?.preview_url;
    if (typeof media === "string" && !/^https?:\/\//i.test(media)) {
      const MEDIA_BASE =
        process.env.MEDIA_BASE?.replace(/\/$/, "") || UPSTREAM_BASE;
      data.url = `${MEDIA_BASE}${media.startsWith("/") ? "" : "/"}${media}`;
    } else if (typeof media === "string") {
      data.url = media;
    }

    console.log("✅ 업로드 프록시 완료:", upstream.status, {
      id: data?.id,
      uuid: data?.uuid,
    });
    return NextResponse.json(data, { status: upstream.status });
  } catch (e: any) {
    console.error("[studio/upload] proxy error:", e?.message || e);
    return NextResponse.json(
      { error: `proxy error: ${e?.message || e}` },
      { status: 500 }
    );
  }
}
