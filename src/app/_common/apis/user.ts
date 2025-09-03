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

  // check는 명세대로 트레일링 슬래시 유지
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

/** 아이디 등록 (명세: POST /api/user — 슬래시 없음) */
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

  // 1차: /api/user  (명세 우선)
  try {
    const data = await apiFetch<any>("/api/user", {
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
    // 405 또는 404면 서버가 슬래시 버전만 받는 환경일 수 있으므로 폴백
    if (/\(405\)|\(404\)/.test(err?.message || "")) {
      console.warn(
        "[registerUser] fallback to /api/user/ due to",
        err?.message
      );
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

    // 이미 존재 케이스 구문 그대로 유지
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
