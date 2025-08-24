// app/api/image/uploaded/route.ts
export const runtime = "nodejs";
import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE}/api/image/uploaded/`,
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
