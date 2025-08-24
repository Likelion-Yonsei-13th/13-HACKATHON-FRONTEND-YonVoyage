// app/_common/apis/onboarding.ts

// 명세 예시에 맞춘 응답 타입(백엔드 응답 구조에 맞게 조정 가능)
export type UploadRes = { uploadId: string; previewUrl?: string };
export type GenerateRes = { resultUrl: string };

export async function uploadOnboardingImage(file: File): Promise<UploadRes> {
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch("/api/image/upload/", { method: "POST", body: fd });
  if (!res.ok) throw new Error("업로드 실패");
  return res.json();
}

export async function generateOnboardingImage(
  uploadId: string,
  prompt?: string
): Promise<GenerateRes> {
  const res = await fetch("/api/image/generate/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uploadId, prompt }),
  });
  if (!res.ok) throw new Error("이미지 생성 실패");
  return res.json();
}

// (선택) 로그인 유저용 업로드
export async function uploadWithPrompt(form: FormData) {
  const res = await fetch("/api/image/upload/prompt", {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error("프롬프트 업로드 실패");
  return res.json();
}
