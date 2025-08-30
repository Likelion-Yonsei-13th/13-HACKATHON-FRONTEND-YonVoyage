// src/app/_common/apis/user.ts
// 브라우저는 내부 라우트만 호출(프록시 경유)

export type CheckUserRes = { exists: boolean; uuid?: string };

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
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`check failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as any;
  return {
    exists: !!(data.exists ?? data.is_exists ?? data.found ?? true),
    uuid: data.uuid ?? data.user_uuid ?? uuid,
  };
}

/** 유저 등록: 서버 스펙에 맞춰 uuid + business_type 동시 전송 & 응답 매핑 */
export async function registerUser(
  nickname: string,
  business_type: string,
  uuid: string
): Promise<RegisterUserRes> {
  const url = `/api/user`;

  // 서버가 다양한 키를 기대할 수 있어 호환 키 동시 전송
  const payload = {
    nickname,
    business_type,
    uuid,
    user_uuid: uuid,
    business: business_type,
    type: business_type,
  };

  // 프리체크(빈 문자열 차단)
  if (!nickname?.trim()) throw new Error("nickname is required");
  if (!business_type?.trim()) throw new Error("business_type is required");
  if (!uuid?.trim()) throw new Error("uuid is required");

  const res = await fetch(url, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`register failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as any;

  // 응답 표준화(서버가 success 누락 시 기본 true)
  return {
    success: !!(data.success ?? true),
    uuid: data.uuid ?? data.user_uuid ?? uuid,
    nickname: data.nickname ?? nickname,
    business_type:
      data.business_type ?? data.business ?? data.type ?? business_type,
    created_at: data.created_at ?? new Date().toISOString(),
  };
}
