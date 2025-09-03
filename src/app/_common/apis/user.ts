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

/** 기존 유저 확인 (명세: POST /api/user/check/ ) */
export async function checkUserByUuid(uuid: string): Promise<CheckUserRes> {
  const payload = { uuid, user_uuid: uuid };
  const data = await apiFetch<any>("/api/user/check/", {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  return {
    exists: !!(data.exists ?? data.is_exists ?? data.found ?? true),
    uuid: data.uuid ?? data.user_uuid ?? uuid,
    nickname: data.nickname ?? data.name ?? null,
    business_type: data.business_type ?? data.business ?? data.type ?? null,
  };
}

/** 아이디 등록 — ✅ 고정: POST /api/user/ */
export async function registerUser(
  nickname: string,
  business_type: string,
  uuid?: string
): Promise<RegisterUserRes> {
  const payload: any = { nickname, business_type };
  if (uuid) {
    payload.uuid = uuid;
    payload.user_uuid = uuid;
  }

  const data = await apiFetch<any>("/api/user/", {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });

  return {
    success: !!(data.success ?? true),
    uuid: data.uuid ?? data.user_uuid ?? uuid ?? "",
    nickname: data.nickname ?? nickname,
    business_type:
      data.business_type ?? data.business ?? data.type ?? business_type,
    created_at: data.created_at ?? new Date().toISOString(),
  };
}
