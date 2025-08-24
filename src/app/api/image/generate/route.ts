// app/api/image/generate/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json(); // { uploadId, prompt? }
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE}/api/image/generate/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.BACKEND_API_KEY
          ? { Authorization: `Bearer ${process.env.BACKEND_API_KEY}` }
          : {}),
      },
      body: JSON.stringify(body),
    }
  );

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
