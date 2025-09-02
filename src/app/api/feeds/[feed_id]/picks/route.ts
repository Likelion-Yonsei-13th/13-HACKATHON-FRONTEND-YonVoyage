import { NextRequest, NextResponse } from "next/server";
import { mockFeeds } from "../../../_mock/data";

// ✅ 두 번째 인자의 타입은 "RouteParams"
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ feed_id: string }> }
) {
  const feed_id = await params;
  const userUUID = req.headers.get("x-user-uuid");

  if (!userUUID) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number(feed_id);
  const item = mockFeeds.find((f) => f.id === id);
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // 토글
  item.picked = !item.picked;
  const pick_count = item.picked ? 34 : 33;

  return NextResponse.json({
    feed_id: id,
    user_uuid: userUUID, // 헤더에서 가져온 UUID는 string 그대로 쓰는게 적절
    picked: item.picked,
    pick_count,
    updated_at: new Date().toISOString(),
  });
}
