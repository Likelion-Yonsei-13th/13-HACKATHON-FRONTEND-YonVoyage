// src/app/_common/apis/onboarding.ts

export type UploadRes = { uploadId: string; previewUrl?: string };
export type GenerateRes = { generated_image_id: string };
export type GetRes = { url: string };

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

/** 업로드: 반드시 uuid와 함께 전송 */
export async function uploadOnboardingImage(
  file: File,
  uuid: string
): Promise<UploadRes> {
  const fd = new FormData();
  fd.append("image", file, file.name); // 서버 기본 필드명
  fd.append("uuid", uuid); // 소유자 매핑
  fd.append("user_uuid", uuid); // 호환용 키

  const url = "/api/studio/upload/";
  console.log(
    "[UPLOAD] →",
    url,
    "file:",
    file.name,
    file.size,
    file.type,
    "uuid:",
    uuid
  );

  const res = await okOrThrow(fetch(url, { method: "POST", body: fd }));
  const raw: any = await res.json().catch(() => ({}));
  console.log("[UPLOAD] ← body:", raw);

  const uploadId =
    raw.uploadId ?? raw.id ?? raw.image_id ?? raw.uploaded_image_id;
  const previewUrl =
    raw.previewUrl ?? raw.url ?? raw.image_url ?? raw.preview_url;

  if (!uploadId) throw new Error("응답에 uploadId 없음");
  return { uploadId: String(uploadId), previewUrl };
}

/** 업로드ID로 생성(보정) 시작 → 생성ID 반환 */
export async function generateOnboardingImage(
  uploadId: string,
  uuid?: string
): Promise<GenerateRes> {
  const url = "/api/studio/generate/";
  const payload: Record<string, any> = { uploaded_image_id: uploadId };
  if (uuid) {
    payload.uuid = uuid;
    payload.user_uuid = uuid;
  }

  console.log("[GENERATE] →", url, "payload:", payload);

  const res = await okOrThrow(
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
  );
  const raw: any = await res.json().catch(() => ({}));
  console.log("[GENERATE] ← body:", raw);

  const generated_image_id =
    raw.generated_image_id ?? raw.generatedId ?? raw.id;
  if (!generated_image_id) throw new Error("응답에 generated_image_id 없음");

  return { generated_image_id: String(generated_image_id) };
}

/** 생성ID로 최종 이미지 조회 */
export async function getGeneratedImage(generatedId: string): Promise<GetRes> {
  const url = `/api/studio/${encodeURIComponent(generatedId)}/`;
  console.log("[GET] →", url);

  const res = await okOrThrow(fetch(url, { method: "GET" }));
  const raw: any = await res.json().catch(() => ({}));
  console.log("[GET] ← body:", raw);

  let urlFromServer: string | undefined =
    raw.url ??
    raw.image_url ??
    raw.resultUrl ??
    raw.previewUrl ??
    raw.generated_image;

  if (!urlFromServer) throw new Error("응답에 url 없음");

  // 상대경로면 절대경로로 보정
  const isAbsolute = /^https?:\/\//i.test(urlFromServer);
  if (!isAbsolute) {
    if (API_BASE) {
      urlFromServer = `${API_BASE}${
        urlFromServer.startsWith("/") ? "" : "/"
      }${urlFromServer}`;
    } else {
      console.warn(
        "[GET] 상대경로 수신, NEXT_PUBLIC_API_BASE 미설정:",
        urlFromServer
      );
    }
  }

  return { url: urlFromServer };
}
