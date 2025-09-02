// src/app/_common/apis/aistudio.ts
export type UploadedImage = { id: string; url: string; createdAt?: string };
export type GeneratedImage = {
  id: string;
  url: string;
  createdAt?: string;
  prompt?: string;
};

type ServerUploaded = {
  id?: number | string;
  uuid?: string;
  // 서버가 이 중 아무거나로 줄 수 있음
  image?: string;
  url?: string;
  uploaded_image?: string;
  uploaded_image_url?: string;
  path?: string;
  uploaded_at?: string;
  created_at?: string;
};

export const HISTORY_CAP = 5;

export function sortChronoAsc<T extends { createdAt?: string }>(list: T[]) {
  return [...list].sort((a, b) => {
    const ta = a.createdAt ? Date.parse(a.createdAt) : 0;
    const tb = b.createdAt ? Date.parse(b.createdAt) : 0;
    return ta - tb;
  });
}
export function keepLastN<T>(list: T[], n = HISTORY_CAP) {
  return list.slice(-n);
}
export function normalizeGenerated(list: GeneratedImage[], cap = HISTORY_CAP) {
  return keepLastN(sortChronoAsc(list), cap);
}
export function appendGeneratedWithCap(
  prev: GeneratedImage[],
  item: GeneratedImage,
  cap = HISTORY_CAP
) {
  return normalizeGenerated([...prev, item], cap);
}
export function hasReachedCap(list: GeneratedImage[], cap = HISTORY_CAP) {
  return list.length >= cap;
}
export function placeholdersCount(list: GeneratedImage[], cap = HISTORY_CAP) {
  return Math.max(0, cap - list.length);
}

async function okOrThrow(res: Response, fallback = "request failed") {
  if (res.ok) return;
  let detail = "";
  try {
    detail = await res.text();
  } catch {}
  throw new Error(
    `${fallback} (${res.status} ${res.statusText})${
      detail ? `: ${detail}` : ""
    }`
  );
}

/** 업로드 */
export async function uploadImage(file: File, uuid?: string) {
  const fd = new FormData();
  fd.append("file", file);
  if (uuid) fd.append("uuid", uuid);

  const res = await fetch(`/api/studio/upload`, { method: "POST", body: fd });
  await okOrThrow(res, "upload failed");

  const raw = (await res.json()) as any;
  // ← 서버/프록시가 어떤 키로 주든 url/id를 뽑아내기
  const id = String(
    raw?.id ?? raw?.uploaded_id ?? raw?.image_id ?? crypto.randomUUID()
  );
  const url =
    raw?.url ??
    raw?.image ??
    raw?.image_url ??
    raw?.uploaded_image_url ??
    raw?.path;

  return { id, url } as { id: string; url: string };
}

/** 생성 요청 */
export async function generateImage(payload: {
  uuid: string;
  prompt: string;
  uploaded_image_id?: string;
}) {
  const res = await fetch(`/api/studio/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  await okOrThrow(res, "generate failed");
  return (await res.json()) as { id: string; url: string };
}

/** 업로드 목록 (POST 명세) */
export async function listUploaded(uuid?: string) {
  const res = await fetch(`/api/studio/uploaded/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify(uuid ? { uuid, user_uuid: uuid } : {}),
  });
  await okOrThrow(res, "list uploaded failed");
  const data = (await res.json()) as ServerUploaded[];

  // 방어적 매핑: url 후보들을 우선순위로 스캔
  return data.map((it) => {
    const url =
      it.url ??
      it.image ??
      it.uploaded_image_url ??
      it.uploaded_image ??
      it.path ??
      "";
    const createdAt = it.uploaded_at ?? it.created_at ?? undefined;
    return { id: String(it.id ?? crypto.randomUUID()), url, createdAt };
  }) as UploadedImage[];
}

/** 생성 목록 (POST 명세) */
export async function listGenerated(uuid?: string) {
  const res = await fetch(`/api/studio/generated/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify(uuid ? { uuid, user_uuid: uuid } : {}),
  });
  await okOrThrow(res, "list generated failed");
  return (await res.json()) as GeneratedImage[];
}

export async function listGeneratedLimited(uuid?: string, cap = HISTORY_CAP) {
  const raw = await listGenerated(uuid);
  return normalizeGenerated(raw, cap);
}

export async function saveGenerated(generatedId: string) {
  const res = await fetch(
    `/api/aistudio/${encodeURIComponent(generatedId)}/save`,
    { method: "POST" }
  );
  await okOrThrow(res, "save failed");
  return await res.json();
}
