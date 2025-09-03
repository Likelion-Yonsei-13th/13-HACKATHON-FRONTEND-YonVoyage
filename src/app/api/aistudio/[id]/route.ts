export const runtime = "nodejs";
import { NextResponse } from "next/server";

const UPSTREAM_BASE =
  process.env.PIXPL_BASE?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ||
  "https://pixpl.com";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const upstream = await fetch(
      `${UPSTREAM_BASE}/api/studio/${encodeURIComponent(params.id)}/`,
      {
        method: "GET",
      }
    );
    const text = await upstream.text().catch(() => "");
    if (!upstream.ok) {
      return new NextResponse(text || `upstream ${upstream.status}`, {
        status: upstream.status,
      });
    }
    const data: any = text ? JSON.parse(text) : {};
    const media = data?.url ?? data?.generated_image ?? data?.image_url;
    if (typeof media === "string" && !/^https?:\/\//i.test(media)) {
      const MEDIA_BASE =
        process.env.MEDIA_BASE?.replace(/\/$/, "") || UPSTREAM_BASE;
      data.url = `${MEDIA_BASE}${media.startsWith("/") ? "" : "/"}${media}`;
    }
    return NextResponse.json(data, { status: upstream.status });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || e }, { status: 500 });
  }
}
