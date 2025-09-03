// src/app/api/user/check/route.ts
export const runtime = "nodejs";
import { NextResponse } from "next/server";

const UPSTREAM_BASE =
  process.env.PIXPL_BASE?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ||
  "https://pixpl.com";

const MEDIA_BASE = process.env.MEDIA_BASE?.replace(/\/$/, "") || null;

function absolutize(u?: string) {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  const base = MEDIA_BASE || UPSTREAM_BASE;
  return `${base}${u.startsWith("/") ? "" : "/"}${u}`;
}

export async function POST(req: Request) {
  try {
    const raw = await req.json().catch(() => ({} as any));
    console.log("[user/check] client payload:", raw);

    const idAny = raw.uploaded_image_id ?? raw.uploaded_image ?? raw.id;

    // 숫자/문자열 동시 호환
    const idNum =
      typeof idAny === "string" && /^\d+$/.test(idAny) ? Number(idAny) : idAny;
    const idStr = String(idAny ?? "");

    // 업스트림 바디: 두 키 모두 포함 (서버별 파서 호환)
    const payload: Record<string, any> = {
      uploaded_image_id: idNum ?? idStr,
      uploaded_image: idNum ?? idStr, // ✅ 함께 전달
      uuid: raw.uuid ?? raw.user_uuid ?? raw.user,
      prompt: raw.prompt,
      options: raw.options,
    };
    for (const k of Object.keys(payload)) {
      if (payload[k] === undefined || payload[k] === "") delete payload[k];
    }

    const headers: HeadersInit = { "Content-Type": "application/json" };
    const cookie = req.headers.get("cookie");
    if (cookie) headers["cookie"] = cookie;
    const auth = req.headers.get("authorization");
    if (auth) headers["authorization"] = auth;

    console.log("[user/check] → upstream body:", payload);

    const upstream = await fetch(`${UPSTREAM_BASE}/api/user/check/`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const text = await upstream.text().catch(() => "");
    if (!upstream.ok) {
      console.error(
        "❌ user/check upstream fail:",
        upstream.status,
        text?.slice(0, 400)
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

    const media = data?.url ?? data?.generated_image ?? data?.image_url;
    if (typeof media === "string") {
      data.url = absolutize(media);
    }

    console.log("✅ user/check ok:", upstream.status, {
      id: data?.id,
      uuid: data?.uuid,
      url: data?.url,
    });
    const res = NextResponse.json(data, { status: upstream.status });
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch (e: any) {
    console.error("[user/check] proxy error:", e?.message || e);
    return NextResponse.json(
      { error: `proxy error: ${e?.message || e}` },
      { status: 500 }
    );
  }
}
