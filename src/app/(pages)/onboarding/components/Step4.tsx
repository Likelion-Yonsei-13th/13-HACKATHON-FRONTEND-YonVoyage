// src/app/(pages)/onboarding/components/Step4.tsx
"use client";
import { useRef, useState, useEffect, useMemo } from "react";
import type { StepProps } from "./types";
import { uploadOnboardingImage } from "@/app/_common/apis/onboarding";

// 로컬 uuid 유틸
function getUUID() {
  if (typeof window === "undefined") return "";
  const KEY = "aistudio_uuid";
  let v = localStorage.getItem(KEY);
  if (!v) {
    v = crypto.randomUUID();
    localStorage.setItem(KEY, v);
  }
  return v;
}

async function avifToPng(file: File): Promise<File> {
  const bitmap = await createImageBitmap(
    await file.arrayBuffer().then((b) => new Blob([b]))
  );
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0);
  const blob: Blob = await new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob 실패"))),
      "image/png"
    )
  );
  return new File([blob], file.name.replace(/\.avif$/i, ".png"), {
    type: "image/png",
  });
}

export default function Step4({ value, onChange }: StepProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const uuid = useMemo(() => getUUID(), []);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const pickFile = () => inputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let f = e.target.files?.[0] ?? null;
    if (!f) return;

    try {
      // 미리보기는 현재 스텝에서만 사용
      const blobUrl = URL.createObjectURL(f);
      setFile(f);
      setPreviewUrl(blobUrl);

      if (f.type === "image/avif") {
        try {
          f = await avifToPng(f);
          console.log("[Step4] AVIF → PNG 변환 완료:", f.name, f.type);
        } catch (err) {
          console.warn("[Step4] AVIF 변환 실패, 원본으로 업로드 시도:", err);
        }
      }

      setLoading(true);
      const res = await uploadOnboardingImage(f, uuid); // ← uuid 전달
      const uploadId = String(res.uploadId ?? "");
      const serverUrl =
        res.url && /^https?:\/\//i.test(res.url) ? res.url : undefined;

      // 부모 answers[4]에 업로드 식별자 전달
      onChange(uploadId);

      // 브리지 저장 (blob은 절대 저장하지 않음)
      const prev = JSON.parse(
        localStorage.getItem("aistudio_bridge_last") || "{}"
      );
      localStorage.setItem(
        "aistudio_bridge_last",
        JSON.stringify({
          ...prev,
          uploadedId: uploadId,
          uploadedUrl: serverUrl || undefined,
          ts: Date.now(),
        })
      );
    } catch (err) {
      console.error("[Step4] 업로드 에러:", err);
      alert("업로드에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[60vh] flex flex-col items-center justify-center gap-8">
      <h2 className="text-2xl font-bold text-white">내 음식사진 업로드</h2>

      <div
        className="rounded-lg text-gray-200"
        style={{
          width: 454,
          height: 356,
          minWidth: 280,
          borderRadius: 12,
          backgroundColor: "rgba(33,34,37,1)",
          padding: 32,
        }}
      >
        <div className="h-full w-full flex flex-col items-center justify-center gap-5">
          <div
            onClick={pickFile}
            className="w-[220px] h-[220px] rounded-md bg-[#2B2C2F] hover:bg-[#303135] cursor-pointer flex items-center justify-center overflow-hidden transition"
            title="이미지 선택"
          >
            {file && previewUrl ? (
              <img
                src={previewUrl}
                alt="선택된 이미지 미리보기"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-sm text-gray-400">
                클릭해서 이미지를 업로드 해주세요.
              </span>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif"
            className="hidden"
            onChange={handleFileChange}
            disabled={loading}
          />
          {loading && <div className="text-sm text-white/60">업로드 중…</div>}
        </div>
      </div>
    </section>
  );
}
