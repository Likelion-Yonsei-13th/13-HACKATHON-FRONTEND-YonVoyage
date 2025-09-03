// src/app/_common/apis/onboarding.ts

export type UploadRes = { uploadId: string; previewUrl?: string };

export type GenerateRes = {
  generated_image_id: string;
  generated_image_url?: string; // GET으로 받은 최종 이미지 URL
};

export type GeneratedDetail = {
  id: number | string;
  uuid: string | null;
  uploaded_image: number | string;
  prompt: string | null;
  generated_image: string;
  generated_at: string;
};

export type GetRes = GeneratedDetail & { url: string };

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/$/, "");

/** 공통: Response 또는 Promise<Response>를 받아 OK 아니면 에러 */
async function okOrThrow(resOrPromise: Response | Promise<Response>) {
  const res = await resOrPromise;
  if (!res.ok) {
    const text = await res.text().catch(() => "응답 본문을 읽을 수 없음");
    throw new Error(
      `request failed (${res.status} ${res.statusText}): ${text}`
    );
  }
  return res;
}

/** 상대경로면 절대경로로 보정 */
function absolutizeUrl(u: string) {
  if (typeof u !== "string") return u as any;
  if (/^https?:\/\//i.test(u)) return u;
  if (API_BASE) {
    return `${API_BASE}${u.startsWith("/") ? "" : "/"}${u}`;
  }
  console.warn(
    "[absolutizeUrl] 상대경로 수신, NEXT_PUBLIC_API_BASE 미설정:",
    u
  );
  return u;
}

/** 업로드 */
export async function uploadOnboardingImage(file: File, uuid?: string) {
  const fd = new FormData();
  fd.append("image", file, file.name);
  if (uuid && uuid.trim()) fd.append("uuid", uuid.trim());

  const url = "/api/studio/upload/";
  console.log("[UPLOAD] →", url, "file:", file.name, file.size, file.type);

  const res = await okOrThrow(
    fetch(url, { method: "POST", body: fd, credentials: "include" })
  );
  const raw: any = await res.json().catch(() => ({}));
  console.log("[UPLOAD] ← body:", raw);

  const uploadId =
    raw.uploadId ?? raw.id ?? raw.image_id ?? raw.uploaded_image_id;
  const previewUrl =
    raw.previewUrl ?? raw.url ?? raw.image_url ?? raw.preview_url;

  if (!uploadId) throw new Error("응답에 uploadId 없음");
  return { uploadId: String(uploadId), previewUrl };
}

/** 생성(보정) 트리거 */
export async function generateOnboardingImage(
  uploadId: string,
  params?: { uuid?: string; prompt?: string; options?: string[] } | string
): Promise<GenerateRes> {
  const uuid = typeof params === "string" ? params : params?.uuid;
  const prompt = typeof params === "string" ? undefined : params?.prompt;
  const optionsParam = typeof params === "string" ? undefined : params?.options;

  const imgIdNum = /^\d+$/.test(String(uploadId))
    ? Number(uploadId)
    : undefined;
  const imgIdStr = String(uploadId);

  // (1) 유저 체크
  const checkPayload: Record<string, any> = {
    uploaded_image_id: imgIdNum ?? imgIdStr,
    uploaded_image: imgIdNum ?? imgIdStr,
  };
  if (uuid) checkPayload.uuid = uuid;
  if (prompt) checkPayload.prompt = prompt;

  if (!uuid) {
    checkPayload.options =
      Array.isArray(optionsParam) && optionsParam.length
        ? optionsParam
        : ["basic", "composition"];
  } else if (Array.isArray(optionsParam) && optionsParam.length) {
    checkPayload.options = optionsParam;
  }

  console.log("[GENERATE] step1 /api/user/check →", checkPayload);
  await okOrThrow(
    fetch("/api/user/check/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(checkPayload),
    })
  )
    .then((r) => r.json().catch(() => ({})))
    .then((j) => console.log("[GENERATE] step1 ←", j));

  // (2) 생성 트리거
  const genPayload: Record<string, any> = {
    uploaded_image_id: imgIdNum ?? imgIdStr,
    uploaded_image: imgIdNum ?? imgIdStr,
    ...(prompt ? { prompt } : {}),
  };
  if (uuid) {
    genPayload.uuid = uuid; // ✅ 이것만 보냄
  }

  console.log("[GENERATE] step2 /api/studio/generate →", genPayload);
  const genRes = await okOrThrow(
    fetch("/api/studio/generate/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(genPayload),
    })
  );

  const genRaw: any = await genRes.json().catch(() => ({}));
  console.log("[GENERATE] step2 ←", genRaw);

  const generated_image_id =
    genRaw.generated_image_id ?? genRaw.generatedId ?? genRaw.id;
  if (!generated_image_id) {
    throw new Error("응답에 generated_image_id 없음");
  }

  // (3) GET /api/studio/{id}/
  const detail = await getGeneratedImage(String(generated_image_id));
  return {
    generated_image_id: String(generated_image_id),
    generated_image_url: detail.url,
  };
}

/** 생성ID로 최종 이미지 조회 */
export async function getGeneratedImage(generatedId: string): Promise<GetRes> {
  const url = `/api/studio/${encodeURIComponent(generatedId)}/`;
  console.log("[GET] →", url);

  const res = await okOrThrow(
    fetch(url, { method: "GET", credentials: "include" })
  );
  const raw: any = await res.json().catch(() => ({}));
  console.log("[GET] ← body:", raw);

  const detail: GeneratedDetail = {
    id: raw.id,
    uuid: raw.uuid ?? null,
    uploaded_image: raw.uploaded_image,
    prompt: raw.prompt ?? null,
    generated_image: absolutizeUrl(raw.generated_image ?? raw.url),
    generated_at: raw.generated_at,
  };
  return { ...detail, url: detail.generated_image };
}
