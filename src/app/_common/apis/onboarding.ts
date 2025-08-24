// app/_common/apis/onboarding.ts

export type UploadRes = { uploadId: string; previewUrl?: string };
export type GenerateRes = { generated_image_id: string };
export type GetRes = { url: string };

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE ?? "").replace(/\/$/, "");

/** 업로드: 서버는 일반적으로 'file' 키를 받지만 'image'만 받는 경우도 대응 */
export async function uploadOnboardingImage(file: File): Promise<UploadRes> {
  const fd = new FormData();
  fd.append("file", file, file.name);
  fd.append("image", file, file.name);

  const url = `${API_BASE}/api/studio/upload/`;
  console.log("[UPLOAD] 요청 URL:", url);
  console.log("[UPLOAD] 전송 파일:", file.name, file.size, file.type);

  const res = await fetch(url, {
    method: "POST",
    body: fd,
    credentials: "include",
  });

  console.log("[UPLOAD] 응답 상태:", res.status, res.statusText);

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[UPLOAD] 실패 응답 본문:", text);
    throw new Error(`업로드 실패 (${res.status}): ${text}`);
  }

  const raw: any = await res.json();
  console.log("[UPLOAD] 성공 응답 raw:", raw);

  // 서버 응답을 통일된 형태로 매핑
  const uploadId =
    raw.uploadId ?? raw.id ?? raw.image_id ?? raw.uploaded_image_id;
  const previewUrl =
    raw.previewUrl ?? raw.url ?? raw.image_url ?? raw.preview_url;

  console.log(
    "[UPLOAD] 매핑된 uploadId:",
    uploadId,
    " previewUrl:",
    previewUrl
  );

  if (!uploadId) throw new Error("응답에 uploadId 없음");
  return { uploadId, previewUrl };
}

/** 업로드ID로 생성(보정) 시작 → 생성ID 반환 */
export async function generateOnboardingImage(
  uploadId: string
): Promise<GenerateRes> {
  const url = `${API_BASE}/api/studio/generate/`;
  const payload = { uploaded_image_id: uploadId };

  console.log("[GENERATE] 요청 URL:", url);
  console.log("[GENERATE] 요청 Payload:", payload);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  console.log("[GENERATE] 응답 상태:", res.status, res.statusText);

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[GENERATE] 실패 응답 Body:", text);
    throw new Error(`이미지 생성 실패 (${res.status}): ${text}`);
  }

  const raw = (await res.json()) as any;
  console.log("[GENERATE] 성공 응답 Body:", raw);

  const generated_image_id =
    raw.generated_image_id ?? raw.generatedId ?? raw.id;
  if (!generated_image_id) throw new Error("응답에 generated_image_id 없음");
  return { generated_image_id };
}

/** 생성ID로 최종 이미지 조회 */
export async function getGeneratedImage(
  generated_image_id: string
): Promise<GetRes> {
  const urlReq = `${API_BASE}/api/studio/${encodeURIComponent(
    generated_image_id
  )}`;
  console.log("[GET] 요청 URL:", urlReq);

  const res = await fetch(urlReq, {
    method: "GET",
    credentials: "include",
  });

  console.log("[GET] 응답 상태:", res.status, res.statusText);

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[GET] 실패 응답 Body:", text);
    throw new Error(`결과 조회 실패 (${res.status}): ${text}`);
  }

  const raw: any = await res.json();
  console.log("[GET] 성공 응답 Body:", raw);

  const url =
    raw.url ??
    raw.image_url ??
    raw.resultUrl ??
    raw.previewUrl ??
    raw.generated_image_url;

  if (!url) throw new Error("응답에 url 없음");
  return { url };
}
