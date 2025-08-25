import type {
    FeedItem,
    FeedListResponse,
    FeedDetail,
    TogglePickResponse,
} from "./types";

// BASE URL 조합 (개발: /api/proxy, 운영: https://pixpl.com)
function joinUrl(path: string) {
    const base = process.env.NEXT_PUBLIC_API_BASE ?? "";
    return base + path;
}

// =====================
// 피드 목록 조회
// =====================
export async function getFeeds(args: {
    offset?: number;
    limit?: number;
    business_type?: string;
    picked_only?: boolean;
    userUUID?: string;
}) {
    const { offset = 0, limit = 20, business_type, picked_only, userUUID } = args;

    const qs = new URLSearchParams();
    qs.set("offset", String(offset));
    qs.set("limit", String(limit));
    if (business_type) qs.set("business_type", business_type);
    if (picked_only) qs.set("picked_only", "true");

    const headers: HeadersInit = {};
    if (picked_only && userUUID) {
        headers["X-User-UUID"] = userUUID;
    }

    const res = await fetch(joinUrl(`/feeds/?${qs.toString()}`), {
        method: "GET",
        headers,
        cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as FeedListResponse;
}

// =====================
// 피드 상세 조회
// =====================
export async function getFeedDetail(
    feedId: number,
    opts?: { userUUID?: string }
) {
    const headers: HeadersInit = {};
    if (opts?.userUUID) {
        headers["X-User-UUID"] = opts.userUUID;
    }

    const res = await fetch(joinUrl(`/feeds/${feedId}/`), {
        method: "GET",
        headers,
        cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as FeedDetail;
}

// =====================
// 좋아요 토글
// =====================
export async function togglePick(feedId: number, userUUID: string) {
    const res = await fetch(joinUrl(`/feeds/${feedId}/picks/`), {
        method: "POST",
        headers: {
            "X-User-UUID": userUUID,
        },
        cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as TogglePickResponse;
}

// =====================
// 내 피드 삭제
// =====================
export async function deleteFeed(feedId: number, userUUID: string) {
    const res = await fetch(joinUrl(`/feeds/${feedId}/`), {
        method: "DELETE",
        headers: {
            "X-User-UUID": userUUID,
        },
        cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as { message: string };
}
