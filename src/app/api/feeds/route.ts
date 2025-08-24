import { NextResponse } from "next/server";
import { mockFeeds } from "../_mock/data";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const offset = Number(searchParams.get("offset") ?? "0");
    const limit  = Number(searchParams.get("limit") ?? "20");
    const business_type = searchParams.get("business_type") ?? undefined;
    const picked_only = (searchParams.get("picked_only") ?? "false") === "true";
    const userUUID = (req.headers.get("x-user-uuid") ?? "").trim();

    let list = mockFeeds;

    if (business_type) {
        list = list.filter(f => f.business_type === business_type);
    }
    // picked_only는 로그인(=UUID 존재)일 때만 반영
    if (picked_only && userUUID) {
        list = list.filter(f => f.picked);
    }

    const sliced = list.slice(offset, offset + limit);

    return NextResponse.json({
        feeds: sliced,
        offset,
        limit,
        total: list.length,
    });
}
