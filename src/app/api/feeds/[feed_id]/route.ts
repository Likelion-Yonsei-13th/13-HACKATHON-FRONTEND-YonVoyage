import { NextResponse } from "next/server";
import { mockFeeds } from "../../_mock/data";

export async function GET(
    _req: Request,
    { params }: { params: { feed_id: string } }
) {
    const id = Number(params.feed_id);
    const base = mockFeeds.find(f => f.id === id);
    if (!base) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({
        id: base.id,
        uuid: base.uuid,
        nickname: "맛집요정",
        business_type: base.business_type,
        generated_image_id: base.generated_image_id,
        image_url: base.image_url,
        before_image_url: base.image_url.replace("/600/800", "/600/600"),
        prompt: "발렌타인데이 느낌으로 플레이팅을 바꿔줘",
        user_tag: ["비건요리","분위기좋음"],
        picked: base.picked,
        pick_count: 12,
        created_at: base.created_at,
        is_mine: base.uuid === 40, // 임시 로직
    });
}

export async function DELETE(
    req: Request,
    { params }: { params: { feed_id: string } }
) {
    const userUUID = req.headers.get("x-user-uuid");
    if (!userUUID) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 목에선 실제 삭제는 안 하고 성공 메시지만 반환
    return NextResponse.json({ message: "피드가 성공적으로 삭제되었습니다." });
}
