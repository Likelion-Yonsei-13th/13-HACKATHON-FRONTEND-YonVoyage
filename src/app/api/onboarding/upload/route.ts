// app/api/image/upload/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  // 백엔드로 프록시
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE}/api/image/upload/`,
    {
      method: "POST",
      body: fd,
      headers: {
        ...(process.env.BACKEND_API_KEY
          ? { Authorization: `Bearer ${process.env.BACKEND_API_KEY}` }
          : {}),
      },
    }
  );

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
