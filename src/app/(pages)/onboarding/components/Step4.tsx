// src/app/(pages)/onboarding/components/Step4.tsx
"use client";
import { useRef, useState } from "react";
import type { StepProps } from "./types";
import { uploadOnboardingImage } from "@/app/_common/apis/onboarding";

export default function Step4({ value, onChange }: StepProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const pickFile = () => inputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (!f) return;
    try {
      setLoading(true);
      const { uploadId } = await uploadOnboardingImage(f);
      onChange(uploadId); // 부모 answers[3] 등에 저장
    } catch (err) {
      console.error(err);
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
          width: "454px",
          height: "356px",
          minWidth: "280px",
          borderRadius: "12px",
          backgroundColor: "rgba(33,34,37,1)",
          padding: "32px",
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
            accept="image/*"
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
