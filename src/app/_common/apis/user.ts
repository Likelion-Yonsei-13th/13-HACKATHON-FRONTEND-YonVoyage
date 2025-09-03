// src/app/_common/apis/user.ts
export type CheckUserRes = {
  exists: boolean;
  uuid?: string;
  nickname?: string | null;
  business_type?: string | null;
};

export type RegisterUserRes = {
  success: boolean;
  uuid: string;
  nickname: string;
  business_type: string;
  created_at: string;
};

function jsonHeaders() {
  return { "Content-Type": "application/json" };
}

const base = process.env.NEXT_PUBLIC_API_BASE!;
const withBase = (p: string) => `${base}${p}`;

async function apiFetch<T>(path: string, init: RequestInit): Promise<T> {
  const url = withBase(path);
  console.log("[API 요청]", init.method ?? "GET", url, init.body ?? "");
  const res = await fetch(url, init);
  const text = await res.text().catch(() => "");
  console.log("[API 응답]", res.status, url, text.slice(0, 300));
  if (!res.ok) throw new Error(`API Error (${res.status}): ${text}`);
  try {
    return JSON.parse(text) as T;
  } catch {
    return {} as T;
  }
}

/** 브라우저에서 UUID 형식 보장 */
export function ensureUUID(v?: string) {
  const re =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (v && re.test(v)) return v;
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : v ?? "";
}

/** 기존 유저 확인 — 명세: POST /api/user/check/ */
export async function checkUserByUuid(uuid: string): Promise<CheckUserRes> {
  const payload = { uuid };
  const data = await apiFetch<any>("/api/user/check/", {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  return {
    exists: !!(data.exists ?? data.is_exists ?? data.found ?? true),
    uuid: data.uuid ?? uuid,
    nickname: data.nickname ?? null,
    business_type: data.business_type ?? null,
  };
}

/** 아이디 등록 — 명세: POST /api/user/  (객체 파라미터) */
export async function registerUser(params: {
  uuid: string;
  nickname: string;
  business_type: string;
  is_profile_public?: boolean;
}): Promise<RegisterUserRes> {
  const { uuid, nickname, business_type, is_profile_public = true } = params;

  const payload = { uuid, nickname, business_type, is_profile_public };

  const data = await apiFetch<any>("/api/user/", {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });

  return {
    success: !!(data.success ?? true),
    uuid: data.uuid ?? uuid,
    nickname: data.nickname ?? nickname,
    business_type: data.business_type ?? business_type,
    created_at: data.created_at ?? new Date().toISOString(),
  };
}
