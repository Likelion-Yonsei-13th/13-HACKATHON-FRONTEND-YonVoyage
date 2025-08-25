// src/app/_common/apis/aistudio.ts

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

/** 내부 라우트만 호출 (프록시 경유) */
export async function uploadImage(file: File, uuid?: string) {
  const fd = new FormData();
  fd.append("file", file);
  if (uuid) fd.append("uuid", uuid);

  const res = await fetch(`/api/aistudio/upload`, {
    method: "POST",
    body: fd,
  });
  await okOrThrow(res, "upload failed");
  return (await res.json()) as { id: string; url: string };
}

/** { uuid, prompt, uploaded_image_id } */
export async function generateImage(payload: {
  uuid: string;
  prompt: string;
  uploaded_image_id?: string;
}) {
  const res = await fetch(`/api/aistudio/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  await okOrThrow(res, "generate failed");
  return (await res.json()) as { id: string; url: string };
}

export async function listUploaded(uuid?: string) {
  const q = uuid ? `?uuid=${encodeURIComponent(uuid)}` : "";
  const res = await fetch(`/api/aistudio/uploaded/${q}`, { cache: "no-store" });
  await okOrThrow(res, "list uploaded failed");
  return (await res.json()) as UploadedImage[];
}

export async function listGenerated(uuid?: string) {
  const q = uuid ? `?uuid=${encodeURIComponent(uuid)}` : "";
  const res = await fetch(`/api/aistudio/generated/${q}`, {
    cache: "no-store",
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
