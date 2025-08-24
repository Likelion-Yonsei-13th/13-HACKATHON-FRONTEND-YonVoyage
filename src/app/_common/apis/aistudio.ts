// src/app/_common/apis/aistudio.ts

/** ---------- Types ---------- */
export type UploadedImage = {
  id: string;
  url: string;
  createdAt?: string;
};

export type GeneratedImage = {
  id: string;
  url: string;
  createdAt?: string;
  prompt?: string;
};

/** ---------- History strip spec ---------- */
export const HISTORY_CAP = 5;

/** 오래된 → 최신(오름차순) 정렬 */
export function sortChronoAsc<T extends { createdAt?: string }>(list: T[]) {
  return [...list].sort((a, b) => {
    const ta = a.createdAt ? Date.parse(a.createdAt) : 0;
    const tb = b.createdAt ? Date.parse(b.createdAt) : 0;
    return ta - tb;
  });
}

/** 마지막 n개만 유지(기본 5개) */
export function keepLastN<T>(list: T[], n = HISTORY_CAP) {
  return list.slice(-n);
}

/** 생성 결과를 히스토리 스트립 규칙(오름차순 + 마지막 5개)로 정규화 */
export function normalizeGenerated(list: GeneratedImage[], cap = HISTORY_CAP) {
  return keepLastN(sortChronoAsc(list), cap);
}

/** 새 결과를 추가하고 정규화(오름차순 + 마지막 5개 유지) */
export function appendGeneratedWithCap(
  prev: GeneratedImage[],
  item: GeneratedImage,
  cap = HISTORY_CAP
) {
  return normalizeGenerated([...prev, item], cap);
}

/** 5칸 다 찼는지 */
export function hasReachedCap(list: GeneratedImage[], cap = HISTORY_CAP) {
  return list.length >= cap;
}

/** 플레이스홀더(Free) 갯수 */
export function placeholdersCount(list: GeneratedImage[], cap = HISTORY_CAP) {
  return Math.max(0, cap - list.length);
}

/** ---------- API Base ---------- */
// 환경변수(없으면 동일 도메인 상대경로 사용)
const API_BASE = process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ?? "";

// 필요 시 공통 옵션(예: 인증 토큰) 여기서 세팅
function headers() {
  const h: Record<string, string> = {};
  // const token = getTokenSomehow();
  // if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

/** ---------- APIs ---------- */
export async function uploadImage(file: File) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API_BASE}/api/studio/upload/`, {
    method: "POST",
    body: fd,
  });
  if (!res.ok) throw new Error("upload failed");
  return (await res.json()) as { id: string; url: string };
}

export async function generateImage(payload: {
  uuid?: string;
  prompt: string;
  image_id?: string;
}) {
  const res = await fetch(`${API_BASE}/api/studio/generate/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("generate failed");
  return (await res.json()) as { id: string; url: string };
}

export async function listUploaded(uuid?: string) {
  const q = uuid ? `?uuid=${encodeURIComponent(uuid)}` : "";
  const res = await fetch(`${API_BASE}/api/studio/uploaded/${q}`, {
    method: "GET",
    cache: "no-store",
    headers: headers(),
  });
  if (!res.ok) throw new Error("list uploaded failed");
  return (await res.json()) as UploadedImage[];
}

/** 원본 목록(정규화 전) */
export async function listGenerated(uuid?: string) {
  const q = uuid ? `?uuid=${encodeURIComponent(uuid)}` : "";
  const res = await fetch(`${API_BASE}/api/studio/generated/${q}`, {
    method: "GET",
    cache: "no-store",
    headers: headers(),
  });
  if (!res.ok) throw new Error("list generated failed");
  return (await res.json()) as GeneratedImage[];
}

/** 정규화된 목록(오름차순 + 마지막 5개) */
export async function listGeneratedLimited(uuid?: string, cap = HISTORY_CAP) {
  const raw = await listGenerated(uuid);
  return normalizeGenerated(raw, cap);
}

export async function saveGenerated(generatedId: string) {
  const res = await fetch(
    `${API_BASE}/api/studio/${encodeURIComponent(generatedId)}/save`,
    { method: "POST", headers: headers() }
  );
  if (!res.ok) throw new Error("save failed");
  return await res.json();
}
