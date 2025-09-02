// gallery/_lib/api.ts
import type {
  FeedItem,
  FeedListResponse,
  FeedDetail,
  TogglePickResponse,
} from "./types";

/**
 * 운영: https://pixpl.com/api
 * 개발(프록시 사용 시): /api/proxy  ← 프록시가 백엔드의 /api/* 로 라우팅되도록 설정
 *
 * ※ 꼭 .env에 NEXT_PUBLIC_API_BASE를 지정하세요.
 *    미지정 시 기본값을 운영 호스트로 둡니다.
 */
const BASE = (process.env.NEXT_PUBLIC_API_BASE ?? "https://pixpl.com").replace(
  /\/$/,
  ""
);
function joinUrl(path: string) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${BASE}${p}`;
}

async function okOrThrow(res: Response) {
  if (res.ok) return;
  // 목록이 없어서 404가 떨어지는 백엔드 대비 (명세/운영 정책에 따라 다르면 제거)
  if (res.status === 404) throw new Error("404");
  const text = await res.text().catch(() => "");
  throw new Error(`HTTP ${res.status}${text ? `: ${text}` : ""}`);
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
  // 필요 시 사용자 UUID 헤더(픽 전용) – 백엔드 정책에 맞추어 사용
  if (picked_only && userUUID) headers["X-User-UUID"] = userUUID;

  const url = joinUrl(`/api/feeds/?${qs.toString()}`);
  const res = await fetch(url, { method: "GET", headers, cache: "no-store" });

  // gallery/_lib/api.ts

  if (res.status === 404) {
    // 백엔드가 '목록 없음'을 404로 주는 경우 → 빈 목록 반환
    const empty: Partial<FeedListResponse> = { feeds: [] };
    return empty as FeedListResponse;
  }

  await okOrThrow(res);
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
  if (opts?.userUUID) headers["X-User-UUID"] = opts.userUUID;

  const res = await fetch(joinUrl(`/api/feeds/${feedId}/`), {
    method: "GET",
    headers,
    cache: "no-store",
  });
  await okOrThrow(res);
  return (await res.json()) as FeedDetail;
}

// =====================
// 좋아요(픽) 토글
// =====================
export async function togglePick(feedId: number, userUUID: string) {
  const res = await fetch(joinUrl(`api/feeds/${feedId}/picks/`), {
    method: "POST",
    headers: { "X-User-UUID": userUUID },
    cache: "no-store",
  });
  await okOrThrow(res);
  return (await res.json()) as TogglePickResponse;
}

// =====================
// 내 피드 삭제
// =====================
export async function deleteFeed(feedId: number, userUUID: string) {
  const res = await fetch(joinUrl(`/api/feeds/${feedId}/`), {
    method: "DELETE",
    headers: { "X-User-UUID": userUUID },
    cache: "no-store",
  });
  await okOrThrow(res);
  return (await res.json()) as { message: string };
}
