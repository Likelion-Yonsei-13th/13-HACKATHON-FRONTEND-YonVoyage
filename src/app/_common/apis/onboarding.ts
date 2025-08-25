// src/app/_common/apis/onboarding.ts

export type UploadRes = { uploadId: string; previewUrl?: string };
export type GenerateRes = { generated_image_id: string };
export type GetRes = { url: string };

// 🔧 절대경로 보정에 사용할 BASE (빌드타임에 주입되는 NEXT_PUBLIC만 사용)
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE ?? "").replace(/\/$/, "");

/** 업로드 */
export async function uploadOnboardingImage(file: File): Promise<UploadRes> {
  const fd = new FormData();
  // 업스트림 호환을 위해 image 필드 사용
  fd.append("image", file, file.name);

  const url = "/api/studio/upload/";
  console.log("[UPLOAD] 요청 URL:", url);
  console.log("[UPLOAD] 전송 파일:", file.name, file.size, file.type);

  const res = await fetch(url, { method: "POST", body: fd });
  console.log("[UPLOAD] 응답 상태:", res.status, res.statusText);

  if (!res.ok) {
    const text = await res.text().catch(() => "응답 본문을 읽을 수 없음");
    console.error("[UPLOAD] 실패 응답 본문:", text);
    if (res.status === 413) throw new Error("파일 크기가 너무 큽니다.");
    if (res.status >= 500) throw new Error("서버 내부 오류가 발생했습니다.");
    throw new Error(`업로드 실패 (${res.status}): ${text}`);
  }

  const raw: any = await res.json().catch(() => ({}));
  console.log("[UPLOAD] 성공 응답 raw:", raw);

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
  const url = "/api/studio/generate/";
  const payload = { uploaded_image_id: uploadId };

  console.log("[GENERATE] 요청 URL:", url);
  console.log("[GENERATE] 요청 Payload:", payload);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  console.log("[GENERATE] 응답 상태:", res.status, res.statusText);

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[GENERATE] 실패 응답 Body:", text);
    throw new Error(`이미지 생성 실패 (${res.status}): ${text}`);
  }

  const raw: any = await res.json().catch(() => ({}));
  console.log("[GENERATE] 성공 응답 Body:", raw);

  const generated_image_id =
    raw.generated_image_id ?? raw.generatedId ?? raw.id;
  if (!generated_image_id) throw new Error("응답에 generated_image_id 없음");
  return { generated_image_id };
}

/** 생성ID로 최종 이미지 조회 */
// src/app/_common/apis/onboarding.ts

// ...위의 업로드/생성 함수 동일...

/** 생성ID로 최종 이미지 조회 */
export async function getGeneratedImage(
  generatedId: string
): Promise<{ url: string }> {
  // ✅ 스펙에 맞게 경로 수정: /api/studio/{generated_image_id}
  const url = `/api/studio/${encodeURIComponent(generatedId)}/`;
  console.log("[GET] 요청 URL:", url);

  const res = await fetch(url, { method: "GET" });
  console.log("[GET] 응답 상태:", res.status, res.statusText);

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[GET] 실패 응답 Body:", text);
    throw new Error(`결과 조회 실패 (${res.status}): ${text}`);
  }

  const raw: any = await res.json().catch(() => ({}));
  console.log("[GET] 성공 응답 Body:", raw);

  // 서버가 주는 다양한 키 대응
  let urlFromServer: string | undefined =
    raw.url ??
    raw.image_url ??
    raw.resultUrl ??
    raw.previewUrl ??
    raw.generated_image;

  if (!urlFromServer) throw new Error("응답에 url 없음");

  // 🔧 상대경로면 절대경로로 보정
  const API_BASE = (process.env.NEXT_PUBLIC_API_BASE ?? "").replace(/\/$/, "");
  const isAbsolute = /^https?:\/\//i.test(urlFromServer);
  if (!isAbsolute) {
    if (API_BASE) {
      urlFromServer = `${API_BASE}${
        urlFromServer.startsWith("/") ? "" : "/"
      }${urlFromServer}`;
    } else {
      console.warn(
        "[GET] 상대경로를 받았지만 NEXT_PUBLIC_API_BASE가 비어 있음:",
        urlFromServer
      );
    }
  }

  return { url: urlFromServer };
}
