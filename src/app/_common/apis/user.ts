// src/app/_common/apis/user.ts
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE ?? "").replace(/\/$/, "");

export type CheckUserRes = { exists: boolean; uuid?: string };
export type RegisterUserRes = { uuid: string };

function jsonHeaders() {
  return { "Content-Type": "application/json" };
}

/** 기존 유저 확인: uuid가 있어야 호출 가능 */
export async function checkUserByUuid(uuid: string): Promise<CheckUserRes> {
  const url = `${API_BASE}/api/user/check/`;
  // 서버가 어떤 키를 기대할지 몰라 둘 다 보냄(uuid / user_uuid)
  const payload = { uuid, user_uuid: uuid };
  console.log("[USER check] URL:", url, "payload:", payload);

  const res = await fetch(url, {
    method: "POST",
    headers: jsonHeaders(),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  console.log("[USER check] status:", res.status, res.statusText);

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[USER check] fail body:", text);
    throw new Error(`check failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as any;
  console.log("[USER check] ok body:", data);

  return {
    exists: !!(data.exists ?? data.is_exists ?? data.found ?? true),
    uuid: data.uuid ?? data.user_uuid ?? uuid,
  };
}

/** 유저 등록 */
export async function registerUser(
  nickname: string,
  business: string
): Promise<RegisterUserRes> {
  const url = `${API_BASE}/api/user/`;
  const payload = { nickname, business };
  console.log("[USER register] URL:", url, "payload:", payload);

  const res = await fetch(url, {
    method: "POST",
    headers: jsonHeaders(),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  console.log("[USER register] status:", res.status, res.statusText);

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[USER register] fail body:", text);
    throw new Error(`register failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as any;
  console.log("[USER register] ok body:", data);

  const uuid = data.uuid ?? data.user_uuid ?? data.id;
  if (!uuid) throw new Error("uuid missing in response");
  return { uuid };
}
