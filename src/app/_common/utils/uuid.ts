// src/app/_common/utils/uuid.ts
export const UUID_KEY = "aistudio_uuid";

export function getUUID() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(UUID_KEY) || "";
}

export function setUUID(v: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(UUID_KEY, v);
}

export function getOrCreateUUID() {
  if (typeof window === "undefined") return "";
  let v = localStorage.getItem(UUID_KEY);
  if (!v) {
    v = crypto.randomUUID();
    localStorage.setItem(UUID_KEY, v);
  }
  return v;
}

export function forceNewUUID() {
  const v = crypto.randomUUID();
  setUUID(v);
  // 유저 캐시도 초기화(선택)
  if (typeof window !== "undefined") {
    localStorage.removeItem("aistudio_user");
  }
  return v;
}
