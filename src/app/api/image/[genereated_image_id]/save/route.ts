// app/api/image/[generated_image_id]/save/route.ts
export const runtime = "nodejs";
import { NextResponse } from "next/server";

type Params = { params: { generated_image_id: string } };

export async function POST(req: Request, { params }: Params) {
  const { generated_image_id } = params;
  const body = await req.text(); // 보낼 바디가 있으면 그대로 전달 (없으면 빈 바디)

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE}/api/image/${generated_image_id}/save`,
    {
      method: "POST",
      headers: {
        ...(process.env.BACKEND_API_KEY
          ? { Authorization: `Bearer ${process.env.BACKEND_API_KEY}` }
          : {}),
        // 백엔드가 JSON을 요구하면 아래 주석 해제
        // "Content-Type": "application/json",
      },
      body: body.length ? body : undefined,
    }
  );

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
