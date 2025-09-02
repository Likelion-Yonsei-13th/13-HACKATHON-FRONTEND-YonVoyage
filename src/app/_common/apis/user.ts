// src/app/_common/apis/user.ts
// 브라우저는 내부 라우트만 호출(프록시 경유)

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

/** 기존 유저 확인: uuid가 있어야 호출 가능 */
export async function checkUserByUuid(uuid: string): Promise<CheckUserRes> {
  const url = `/api/user/check`;
  // 서버가 어떤 키를 기대할지 몰라 둘 다 보냄
  const payload = { uuid, user_uuid: uuid };

  const res = await fetch(url, {
    method: "POST", // ✅ 서버가 POST 기대
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
    cache: "no-store", // ✅ 항상 최신
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`check failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as any;
  return {
    exists: !!(data.exists ?? data.is_exists ?? data.found ?? true),
    uuid: data.uuid ?? data.user_uuid ?? uuid,
    nickname: data.nickname ?? data.name ?? null, // ✅ 서버 닉네임 전달
    business_type: data.business_type ?? data.business ?? data.type ?? null, // ✅ 업종
  };
}

export async function registerUser(
  nickname: string,
  business_type: string,
  uuid?: string
): Promise<RegisterUserRes> {
  const url = `/api/user`;
  const payload: any = { nickname, business_type };
  if (uuid) {
    payload.uuid = uuid;
    payload.user_uuid = uuid; // 백엔드 호환
  }

  const res = await fetch(url, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });

  // 400인데 "이미 존재" 메시지면 멱등 성공 처리
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    if (/already exists/i.test(text)) {
      const ck = await checkUserByUuid(uuid || "");
      return {
        success: true,
        uuid: ck.uuid || uuid || "",
        nickname,
        business_type,
        created_at: new Date().toISOString(),
      };
    }
    throw new Error(`register failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as any;
  return {
    success: !!(data.success ?? true),
    uuid: data.uuid ?? data.user_uuid ?? uuid ?? "",
    nickname: data.nickname ?? nickname,
    business_type:
      data.business_type ?? data.business ?? data.type ?? business_type,
    created_at: data.created_at ?? new Date().toISOString(),
  };
}
