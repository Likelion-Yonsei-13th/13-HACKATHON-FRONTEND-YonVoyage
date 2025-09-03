export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type RouteCtx = { params: { id: string } };

const UPSTREAM_BASE =
  process.env.PIXPL_BASE?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ||
  "https://pixpl.com";

function absolutize(u?: string) {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  const MEDIA_BASE =
    process.env.MEDIA_BASE?.replace(/\/$/, "") || UPSTREAM_BASE;
  return `${MEDIA_BASE}${u.startsWith("/") ? "" : "/"}${u}`;
}

export async function GET(_req: NextRequest, ctx: RouteCtx) {
  const { id } = ctx.params; // ✅ Next가 기대하는 컨텍스트 타입

  try {
    const upstream = await fetch(
      `${UPSTREAM_BASE}/api/studio/${encodeURIComponent(id)}/`,
      { method: "GET" }
    );

    const text = await upstream.text().catch(() => "");
    if (!upstream.ok) {
      return new NextResponse(text || `upstream ${upstream.status}`, {
        status: upstream.status,
      });
    }

    // 응답 타입을 안전하게 파싱
    let data: unknown = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = {};
    }

    // 생성 결과 스펙: { id, uuid, uploaded_image, prompt, generated_image, generated_at }
    if (
      data &&
      typeof data === "object" &&
      "generated_image" in data &&
      typeof (data as any).generated_image === "string"
    ) {
      const media = (data as any).generated_image as string;
      (data as any).url = absolutize(media); // url 필드 보강
    }

    return NextResponse.json(data, { status: upstream.status });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
