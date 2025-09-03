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

// 공용 fetcher + 로그
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
    // 응답이 JSON이 아닐 때 대비
    return {} as T;
  }
}

/** 기존 유저 확인 */
export async function checkUserByUuid(uuid: string): Promise<CheckUserRes> {
  const payload = { uuid, user_uuid: uuid };
  // ✅ DRF 대비: 트레일링 슬래시 추가
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

/** 아이디 등록 */
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

  try {
    // ✅ DRF 대비: 트레일링 슬래시 추가
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
  } catch (err: any) {
    // 이미 존재 케이스 처리 유지
    if (/already exists/i.test(err.message)) {
      const ck = await checkUserByUuid(uuid || "");
      return {
        success: true,
        uuid: ck.uuid || uuid || "",
        nickname,
        business_type,
        created_at: new Date().toISOString(),
      };
    }
    console.error("[UserInfo] register error:", err);
    throw err;
  }
}
