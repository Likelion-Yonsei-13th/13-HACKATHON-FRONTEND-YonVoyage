import { NextResponse } from "next/server";
import { mockFeeds } from "../../../_mock/data";

export async function POST(req: Request, { params }: { params: { feed_id: string } }) {
    const userUUID = req.headers.get("x-user-uuid");
    if (!userUUID) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = Number(params.feed_id);
    const item = mockFeeds.find(f => f.id === id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // 토글 (목)
    item.picked = !item.picked;
    const pick_count = item.picked ? 34 : 33;

    return NextResponse.json({
        feed_id: id,
        user_uuid: Number(userUUID) || 0,
        picked: item.picked,
        pick_count,
        updated_at: new Date().toISOString(),
    });
}
