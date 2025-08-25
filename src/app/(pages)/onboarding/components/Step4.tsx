// src/app/(pages)/onboarding/components/Step4.tsx
"use client";
import { useRef, useState } from "react";
import type { StepProps } from "./types";
import { uploadOnboardingImage } from "@/app/_common/apis/onboarding";

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
  const [loading, setLoading] = useState(false);

  const pickFile = () => inputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let f = e.target.files?.[0] ?? null;
    if (!f) return;

    try {
      setFile(f); // 미리보기는 원본

      if (f.type === "image/avif") {
        try {
          const converted = await avifToPng(f);
          f = converted;
          console.log(
            "[Step4] AVIF → PNG 변환 완료:",
            converted.name,
            converted.type
          );
        } catch (err) {
          console.warn("[Step4] AVIF 변환 실패, 원본으로 업로드 시도:", err);
        }
      }

      setLoading(true);
      console.log("[Step4] 업로드 시작...");
      const { uploadId } = await uploadOnboardingImage(f);
      console.log("[Step4] 업로드 성공! uploadId =", uploadId);
      onChange(uploadId);
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
            {file ? (
              <img
                src={URL.createObjectURL(file)}
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
