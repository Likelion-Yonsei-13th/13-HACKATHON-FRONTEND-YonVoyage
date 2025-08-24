// src/app/(pages)/onboarding/components/Step3.tsx
"use client";

import { useRef, useState } from "react";
import type { StepProps } from "./types";
import { uploadOnboardingImage } from "@/app/_common/apis/onboarding";

export default function Step4({ value, onChange }: StepProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const pickFile = () => inputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file || loading) return;
    try {
      setLoading(true);
      const { uploadId } = await uploadOnboardingImage(file);
      onChange(uploadId); // 부모 answers[i]에 업로드ID 저장
    } catch (err) {
      console.error(err);
      alert("업로드에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[60vh] flex flex-col items-center justify-center gap-8">
      {/* 제목 */}
      <h2 className="text-2xl font-bold text-white">내 음식사진 업로드</h2>

      {/* 카드(크기/색상 Figma 스펙) */}
      <div
        className="rounded-lg text-gray-200"
        style={{
          width: "454px",
          height: "356px",
          minWidth: "280px",
          borderRadius: "12px",
          backgroundColor: "rgba(33,34,37,1)", // 카드 배경
          padding: "32px",
        }}
      >
        {/* 업로드 영역 */}
        <div className="h-full w-full flex flex-col items-center justify-center gap-5">
          {/* 클릭으로 파일 선택 */}
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
              <span className="text-sm text-gray-400">이미지 선택</span>
            )}
          </div>

          {/* 업로드 버튼(카드 내부) */}
          <button
            type="button"
            onClick={handleUpload}
            disabled={!file || loading}
            className="h-10 w-[140px] rounded-md bg-emerald-500 text-white text-sm hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? "업로드 중..." : "업로드"}
          </button>

          {/* 숨겨진 파일 입력 */}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>
    </section>
  );
}
