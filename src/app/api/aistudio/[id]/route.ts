// src/app/api/aistudio/[id]/route.ts
export const runtime = "nodejs";
import { NextResponse } from "next/server";

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

export async function GET(_req: Request, context: any) {
  const id = String(context?.params?.id ?? "");
  if (!id) {
    return NextResponse.json({ error: "missing id" }, { status: 400 });
  }

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

    let data: any = text ? JSON.parse(text) : {};
    const media =
      data?.url ?? data?.generated_image ?? data?.image_url ?? data?.path;
    if (typeof media === "string") data.url = absolutize(media);

    return NextResponse.json(data, { status: upstream.status });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || String(e) },
      { status: 500 }
    );
  }
}
