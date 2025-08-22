// src/app/(pages)/onboarding/components/Step3.tsx
"use client";

import { useState } from "react";
import { uploadOnboardingImage } from "@/app/_common/apis/onboarding";
import type { StepProps } from "./types";

/**
 * Step3: 이미지 업로드
 * - 로컬에서 파일 선택
 * - 서버로 업로드 후 응답의 uploadId를 onChange로 부모에 전달
 */
export default function Step4({ value, onChange }: StepProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file || loading) return;
    try {
      setLoading(true);
      // 서버 API: 업로드 후 { uploadId } 반환한다고 가정
      const { uploadId } = await uploadOnboardingImage(file);
      onChange(uploadId); // answers[2] = uploadId
    } catch (e) {
      console.error(e);
      alert("업로드에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[60vh] flex flex-col justify-center gap-6">
      <h2 className="text-xl font-semibold">내 음식사진 업로드</h2>

      {/* 미리보기 영역 */}
      <div className="aspect-[4/3] w-full rounded-xl bg-neutral-200/80 flex items-center justify-center overflow-hidden">
        {file ? (
          <img
            src={URL.createObjectURL(file)}
            alt="preview"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-neutral-500">
            이미지를 선택하면 미리보기가 보여요
          </span>
        )}
      </div>

      {/* 파일 선택 + 업로드 버튼 */}
      <div className="flex items-center gap-3">
        <input
          id="file"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <label
          htmlFor="file"
          className="inline-flex h-11 items-center justify-center rounded px-4 bg-neutral-100 hover:bg-neutral-200 cursor-pointer"
        >
          파일 선택
        </label>

        <span className="text-sm text-neutral-600 line-clamp-1">
          {file?.name ?? "선택된 파일 없음"}
        </span>

        <button
          type="button"
          onClick={handleUpload}
          disabled={!file || loading}
          className="ml-auto h-11 px-5 rounded bg-neutral-900 text-white disabled:opacity-50"
        >
          {loading ? "업로드 중..." : "업로드"}
        </button>
      </div>

      {/* 업로드가 된 상태(부모에 저장된 값) 표기 */}
      {!!value && (
        <p className="text-sm text-emerald-600">업로드 완료! ID: {value}</p>
      )}
    </section>
  );
}
