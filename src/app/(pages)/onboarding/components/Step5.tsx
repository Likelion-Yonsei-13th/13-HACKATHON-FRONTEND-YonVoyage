// src/app/(pages)/onboarding/components/Step5.tsx
"use client";

import type { StepProps } from "./types";

/**
 * 결과값 확인: 이전 단계에서 생성된 resultUrl(value)을 카드에 표시.
 * onChange는 이 스텝에선 사용하지 않지만 시그니처 맞추기 위해 유지.
 */
export default function Step5({ value }: StepProps) {
  const resultUrl = value; // Step4에서 set한 이미지 URL

  return (
    <section className="min-h-[60vh] flex flex-col items-center justify-center gap-8">
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
        {resultUrl ? (
          <img
            src={resultUrl}
            alt="생성 결과"
            className="h-full w-full object-cover rounded-md"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-md bg-neutral-800/40 text-neutral-400">
            아직 표시할 이미지가 없어요
          </div>
        )}
      </div>
    </section>
  );
}
