// src/app/_common/utils/uuid.ts
export const UUID_KEY = "aistudio_uuid";

const UUID_V4_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidUUID(v?: string | null): v is string {
  return !!v && UUID_V4_RE.test(v);
}

export function getUUID() {
  if (typeof window === "undefined") return "";
  const v = localStorage.getItem(UUID_KEY) || "";
  return v;
}

export function setUUID(v: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(UUID_KEY, v);
}

export function getOrCreateUUID() {
  if (typeof window === "undefined") return "";
  let v = localStorage.getItem(UUID_KEY);
  if (!isValidUUID(v || "")) {
    v = crypto.randomUUID();
    localStorage.setItem(UUID_KEY, v);
  }
  return v!;
}

export function forceNewUUID() {
  const v = crypto.randomUUID();
  setUUID(v);
  if (typeof window !== "undefined") {
    localStorage.removeItem("aistudio_user");
  }
  return v;
}

/** SSR/초기 렌더에서도 안전하게 보장하고 싶을 때 */
export function ensureUUIDOnClient(): string {
  if (typeof window === "undefined") return "";
  const v = getOrCreateUUID();
  return v;
}
