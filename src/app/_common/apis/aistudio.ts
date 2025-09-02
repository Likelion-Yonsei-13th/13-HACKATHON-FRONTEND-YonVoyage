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

  // 업로드는 /api/studio/upload 경로 사용
  const res = await fetch(`/api/studio/upload`, {
    method: "POST",
    body: fd,
  });
  await okOrThrow(res, "upload failed");

  const raw = (await res.json()) as any;
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

/** { uuid, prompt, uploaded_image_id } */
export async function generateImage(payload: {
  uuid: string;
  prompt: string;
  uploaded_image_id?: string;
}) {
  if (process.env.NODE_ENV !== "production") {
    console.log("[API] /api/aistudio/generate payload", {
      uuid: payload.uuid,
      uploaded_image_id: payload.uploaded_image_id,
      prompt_preview: (payload.prompt || "").slice(0, 200), // 너무 길면 미리보기만
    });
  }

  const res = await fetch(`/api/aistudio/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  await okOrThrow(res, "generate failed");

  // 서버가 때때로 url을 비울 수 있어 옵셔널 처리
  return (await res.json()) as { id: string; url?: string };
}

/** 서버 응답 타입들(키가 들쭉날쭉할 때를 대비) */
type ServerUploaded = {
  id?: number | string;
  url?: string;
  image?: string;
  uploaded_image?: string;
  uploaded_image_url?: string;
  path?: string;
  uploaded_at?: string;
  created_at?: string;
};

type ServerGenerated = {
  id?: number | string;
  url?: string;
  image?: string;
  generated_image?: string;
  generated_image_url?: string;
  path?: string;
  created_at?: string;
  uploaded_at?: string;
  prompt?: string;
};

export async function listUploaded(uuid?: string) {
  const q = uuid ? `?uuid=${encodeURIComponent(uuid)}` : "";
  const res = await fetch(`/api/aistudio/uploaded/${q}`, { cache: "no-store" });
  await okOrThrow(res, "list uploaded failed");
  const data = (await res.json()) as ServerUploaded[];

  return (Array.isArray(data) ? data : [])
    .map((it) => {
      const url =
        it.url ??
        it.image ??
        it.uploaded_image_url ??
        it.uploaded_image ??
        it.path ??
        "";
      if (!url) return null;
      const createdAt = it.uploaded_at ?? it.created_at ?? undefined;
      return { id: String(it.id ?? crypto.randomUUID()), url, createdAt };
    })
    .filter(Boolean) as UploadedImage[];
}

export async function listGenerated(uuid?: string) {
  const q = uuid ? `?uuid=${encodeURIComponent(uuid)}` : "";
  const res = await fetch(`/api/aistudio/generated/${q}`, {
    cache: "no-store",
  });
  await okOrThrow(res, "list generated failed");
  const data = (await res.json()) as ServerGenerated[];

  return (Array.isArray(data) ? data : [])
    .map((it) => {
      const url =
        it.url ??
        it.image ??
        it.generated_image_url ??
        it.generated_image ??
        it.path ??
        "";
      if (!url) return null;
      const createdAt = it.created_at ?? it.uploaded_at ?? undefined;
      return {
        id: String(it.id ?? crypto.randomUUID()),
        url,
        createdAt,
        prompt: it.prompt,
      };
    })
    .filter(Boolean) as GeneratedImage[];
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
