// src/app/(pages)/onboarding/components/Step5.tsx
"use client";

import { useState } from "react";
import type { StepProps } from "./types";

export default function Step5({ value }: StepProps) {
  // Step4에서 저장해둔 resultUrl만 신뢰
  const resultUrl =
    typeof value === "string" && value.trim().length > 0 ? value : "";

  const [err, setErr] = useState(false);

  return (
    <section className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
      {/* 타이틀 */}
      <h2 className="text-2xl font-bold text-white">결과값 확인</h2>

      {/* 카드 */}
      <div
        className="rounded-lg overflow-hidden grid place-items-center"
        style={{
          width: "454px",
          height: "356px",
          minWidth: "280px",
          borderRadius: "12px",
          backgroundColor: "rgba(33, 34, 37, 1)",
          padding: "20px",
        }}
      >
        {resultUrl && !err ? (
          <img
            src={resultUrl}
            alt="생성 결과"
            className="h-full w-full object-cover rounded-md"
            onError={() => setErr(true)}
            referrerPolicy="no-referrer" // 외부 도메인 이미지 안전하게
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-md bg-neutral-800/40 text-neutral-400 text-sm">
            {err
              ? "이미지를 불러오지 못했어요."
              : "아직 표시할 이미지가 없어요"}
          </div>
        )}
      </div>

      {/* 액션 영역 */}
      {resultUrl && !err && (
        <div className="flex items-center gap-3">
          <a
            href={resultUrl}
            target="_blank"
            rel="noreferrer"
            className="h-10 px-4 rounded-md bg-neutral-700 text-white text-sm hover:bg-neutral-600"
          >
            새 탭에서 보기
          </a>
          <a
            href={resultUrl}
            download
            className="h-10 px-4 rounded-md bg-emerald-500 text-black text-sm hover:bg-emerald-400"
          >
            다운로드
          </a>
        </div>
      )}
    </section>
  );
}
