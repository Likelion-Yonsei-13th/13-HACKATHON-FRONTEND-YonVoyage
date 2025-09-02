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
  const emit = onChange ?? (() => {});

  // blob url 정리
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
      // 이전 blob URL 정리
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);

      // 미리보기 먼저 표시
      const blobUrl = URL.createObjectURL(f);
      setFile(f);
      setPreviewUrl(blobUrl);

      // AVIF → PNG 변환 (가능할 때만)
      if (f.type === "image/avif") {
        try {
          f = await avifToPng(f);
          console.log("[Step4] AVIF → PNG 변환 완료:", f.name, f.type);
        } catch (err) {
          console.warn("[Step4] AVIF 변환 실패, 원본 업로드 시도:", err);
        }
      }

      setLoading(true);

      // 서버 업로드
      const res = await uploadOnboardingImage(f, uuid);
      const uploadId = String(res.uploadId ?? "");

      // 서버가 돌려준 http(s) 미리보기 url
      const serverUrl =
        typeof res.previewUrl === "string" &&
        /^https?:\/\//i.test(res.previewUrl)
          ? res.previewUrl
          : undefined;

      // 부모에 업로드 id 전달
      emit(uploadId);

      // 브리지 저장 (blob URL 저장 금지)
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
    <section className="min-h-[60vh] w-full flex flex-col items-center justify-center gap-6 px-4">
      {/* 타이틀 */}
      <h2 className="text-white text-[15px] sm:text-xl font-bold text-center">
        내 음식사진 업로드
      </h2>

      <div
        className="
          mx-auto w-full max-w-[454px]
          rounded-xl bg-[#212225]
          p-5 sm:p-7
          text-gray-200 shadow-[0_8px_16px_rgba(0,0,0,0.25)]
        "
      >
        <div className="w-full flex flex-col items-center gap-5">
          {/* 업로드 박스: 정사각, 반응형 최대 240px */}
          <button
            type="button"
            onClick={pickFile}
            disabled={loading}
            className="
              relative block w-full max-w-[240px] aspect-square
              rounded-md bg-[#2B2C2F] hover:bg-[#303135]
              overflow-hidden transition ring-1 ring-white/10
              focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500
              disabled:opacity-60
            "
            title="이미지 선택"
            aria-label="이미지 업로드"
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="선택된 이미지 미리보기"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="absolute inset-0 grid place-items-center text-[12px] sm:text-sm text-gray-400">
                클릭해서 이미지를 업로드 해주세요.
              </span>
            )}
          </button>

          {/* 실제 파일 입력 */}
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif"
            className="hidden"
            onChange={handleFileChange}
            disabled={loading}
          />

          {loading && <div className="text-sm text-white/70">업로드 중…</div>}
        </div>
      </div>
    </section>
  );
}
