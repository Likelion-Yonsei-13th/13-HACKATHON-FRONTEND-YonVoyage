// src/app/_common/apis/aistudio.ts
export async function uploadWithPrompt(file: File) {
  // return { uploadedId, url }
}
export async function generateFromUpload(payload: {
  // 백엔드가 업로드 ID 또는 직전 생성물 ID를 받는 형태면,
  // 키 이름만 서버에 맞게 바꿔주세요. 예: base_image_id, generated_image_id 등
  uploaded_image_id: string;
  prompt: string;
}) {
  // return { generatedId, url }
}
export async function saveGeneratedImage(generatedId: string, payload?: any) {}
