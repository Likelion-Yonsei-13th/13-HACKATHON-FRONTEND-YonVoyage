// app/onboarding/components/Step3.tsx
"use client";

import { useState } from "react";
import { uploadOnboardingImage } from "@/app/_common/apis/onboarding";

export default function Step3({
  value,
  onChange,
}: {
  value?: string; // 이전에 저장된 uploadId (있다면)
  onChange: (v: string) => void; // uploadId를 부모에 저장
}) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file || loading) return;
    setLoading(true);
    try {
      const { uploadId } = await uploadOnboardingImage(file);
      onChange(uploadId); // answers[2] = uploadId
    } catch (e) {
      console.error(e);
      alert("업로드 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[60vh] flex flex-col justify-center gap-6">
      <h2 className="text-xl font-semibold">내 음식사진 업로드</h2>

      <div className="aspect-[4/3] w-full rounded-xl bg-gray-200 flex items-center justify-center overflow-hidden">
        {file ? (
          <img
            src={URL.createObjectURL(file)}
            alt="preview"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-gray-500">이미지를 선택하세요</span>
        )}
      </div>

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
          className="inline-flex h-11 items-center justify-center rounded px-4 bg-gray-100 hover:bg-gray-200 cursor-pointer"
        >
          파일 선택
        </label>
        <span className="text-sm text-gray-600 line-clamp-1">
          {file?.name ?? "선택된 파일 없음"}
        </span>

        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="ml-auto h-11 px-5 rounded bg-gray-900 text-white disabled:opacity-50"
        >
          {loading ? "업로드 중..." : "업로드"}
        </button>
      </div>
    </section>
  );
}
