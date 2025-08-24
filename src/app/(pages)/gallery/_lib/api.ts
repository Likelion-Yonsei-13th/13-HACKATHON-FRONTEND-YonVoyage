// app/gallery/_lib/api.ts
import type { FeedDetail, FeedListResponse } from "./types";

const RAW_BASE = (process.env.NEXT_PUBLIC_API_BASE ?? "").trim();

/** BASE가 있으면 외부 서버로, 없으면 로컬 상대경로(/api/...)로 */
function joinUrl(base: string, path: string) {
    if (!base) return path; // 모킹: 내부 라우트로 호출
    return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

type CommonOpts = { userUUID?: string };

function buildHeaders(userUUID?: string) {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    if (userUUID) h["X-User-UUID"] = userUUID;
    return h;
}

/** 1) 목록 */
export async function getFeeds(
    params: {
        offset?: number;
        limit?: number;
        business_type?: string;
        picked_only?: boolean;
    } & CommonOpts
): Promise<FeedListResponse> {
    const { offset = 0, limit = 20, business_type, picked_only, userUUID } = params;
    const qs = new URLSearchParams();
    qs.set("offset", String(offset));
    qs.set("limit", String(limit));
    if (business_type) qs.set("business_type", business_type);
    if (typeof picked_only === "boolean") qs.set("picked_only", String(picked_only));

    // 🔧 트레일링 슬래시
    const url = joinUrl(RAW_BASE, `/api/feeds/?${qs.toString()}`);

    const res = await fetch(url, {
        method: "GET",
        headers: buildHeaders(userUUID),
        cache: "no-store",
        credentials: "include",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as FeedListResponse;
}

/** 2) 상세 */
export async function getFeedDetail(feedId: number, opts?: CommonOpts): Promise<FeedDetail> {
    // 🔧 트레일링 슬래시
    const url = joinUrl(RAW_BASE, `/api/feeds/${feedId}/`);
    const res = await fetch(url, {
        method: "GET",
        headers: buildHeaders(opts?.userUUID),
        cache: "no-store",
        credentials: "include",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as FeedDetail;
}

/** 3) 좋아요 토글 */
export async function togglePick(feedId: number, userUUID: string) {
    // 🔧 트레일링 슬래시
    const url = joinUrl(RAW_BASE, `/api/feeds/${feedId}/picks/`);
    const res = await fetch(url, {
        method: "POST",
        headers: buildHeaders(userUUID),
        cache: "no-store",
        credentials: "include",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as {
        feed_id: number;
        user_uuid: number; // BE integer
        picked: boolean;
        pick_count: number;
        updated_at: string;
    };
}

/** 4) 삭제 */
export async function deleteFeed(feedId: number, userUUID: string) {
    // 🔧 트레일링 슬래시
    const url = joinUrl(RAW_BASE, `/api/feeds/${feedId}/`);
    const res = await fetch(url, {
        method: "DELETE",
        headers: buildHeaders(userUUID),
        cache: "no-store",
        credentials: "include",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as { message: string };
}
