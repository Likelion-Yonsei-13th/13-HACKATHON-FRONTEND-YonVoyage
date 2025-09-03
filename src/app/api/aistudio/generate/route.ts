// src/app/api/studio/generate/route.ts
export const runtime = "nodejs";
import { NextResponse } from "next/server";

const UPSTREAM_BASE =
  process.env.PIXPL_BASE?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ||
  "https://pixpl.com";

export async function POST(req: Request) {
  try {
    const raw = await req.json().catch(() => ({} as any));
    console.log("[studio/generate] client payload:", raw);

    // 클라이언트가 무엇을 보내든, id를 최대한 유추
    const idAny = raw.uploaded_image_id ?? raw.uploaded_image ?? raw.id;
    if (idAny == null || idAny === "") {
      return NextResponse.json(
        { error: "missing uploaded_image_id / uploaded_image" },
        { status: 400 }
      );
    }
    const idNum =
      typeof idAny === "string" && /^\d+$/.test(idAny) ? Number(idAny) : idAny;

    const _uuid = raw.uuid ?? raw.user_uuid ?? raw.user;

    // ✅ 업스트림이 `uploaded_image_id`를 요구하므로 반드시 포함
    //    호환을 위해 uploaded_image도 함께 보냄
    const upstreamBody: Record<string, any> = {
      uploaded_image_id: idNum ?? idAny,
      uploaded_image: idNum ?? idAny, // 호환 키
      uuid: _uuid,
      user: raw.user ?? _uuid,
      user_uuid: raw.user_uuid ?? _uuid,
      prompt: raw.prompt,
    };

    // undefined/빈값 제거
    for (const k of Object.keys(upstreamBody)) {
      if (upstreamBody[k] === undefined || upstreamBody[k] === "") {
        delete upstreamBody[k];
      }
    }

    const headers: HeadersInit = { "Content-Type": "application/json" };
    const cookie = req.headers.get("cookie");
    if (cookie) headers["cookie"] = cookie;
    const auth = req.headers.get("authorization");
    if (auth) headers["authorization"] = auth;

    console.log("[studio/generate] → upstream body:", upstreamBody);

    const upstream = await fetch(`${UPSTREAM_BASE}/api/studio/generate/`, {
      method: "POST",
      headers,
      body: JSON.stringify(upstreamBody),
    });

    const text = await upstream.text().catch(() => "");
    if (!upstream.ok) {
      console.error(
        "❌ 생성 프록시 실패:",
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

    const media = data?.url ?? data?.generated_image;
    if (typeof media === "string" && !/^https?:\/\//i.test(media)) {
      const MEDIA_BASE =
        process.env.MEDIA_BASE?.replace(/\/$/, "") || UPSTREAM_BASE;
      data.url = `${MEDIA_BASE}${media.startsWith("/") ? "" : "/"}${media}`;
    } else if (typeof media === "string") {
      data.url = media;
    }

    console.log("✅ 생성 프록시 완료:", upstream.status, {
      id: data?.id,
      uuid: data?.uuid,
      url: data?.url,
    });

    return NextResponse.json(data, { status: upstream.status });
  } catch (e: any) {
    console.error("[studio/generate] proxy error:", e?.message || e);
    return NextResponse.json(
      { error: `proxy error: ${e?.message || e}` },
      { status: 500 }
    );
  }
}
