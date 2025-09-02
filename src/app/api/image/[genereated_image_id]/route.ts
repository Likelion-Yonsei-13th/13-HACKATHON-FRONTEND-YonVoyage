// app/api/image/[generated_image_id]/route.ts
export const runtime = "nodejs";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ generated_image_id: string }> };

export async function GET(_: Request, { params }: Params) {
  const { generated_image_id } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE}/api/image/${generated_image_id}`,
    {
      headers: {
        ...(process.env.BACKEND_API_KEY
          ? { Authorization: `Bearer ${process.env.BACKEND_API_KEY}` }
          : {}),
      },
      cache: "no-store",
    }
  );

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
