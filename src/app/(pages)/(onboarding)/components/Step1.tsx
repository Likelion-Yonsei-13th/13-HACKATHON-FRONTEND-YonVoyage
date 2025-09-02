// src/app/(pages)/onboarding/components/Step1.tsx
"use client";

import type { StepProps } from "./types";

const OPTIONS = [
  "AI 초수",
  "AI 중수 (1~6개월 1번)",
  "AI 고수 (주 3회 이상 활용)",
];

export default function Step1({ value, onChange }: StepProps) {
  const isSelected = (label: string) =>
    Array.isArray(value) ? value.includes(label) : value === label;

  const handleClick = (label: string) => {
    if (Array.isArray(value)) {
      const set = new Set(value);
      set.has(label) ? set.delete(label) : set.add(label);
      onChange?.(Array.from(set));
    } else {
      onChange?.(label);
    }
  };

  return (
    <section className="min-h-[60vh] w-full flex flex-col items-center justify-center gap-6 px-4">
      {/* 타이틀 (Step2와 동일 톤) */}
      <h2 className="text-white text-[15px] sm:text-xl font-bold text-center">
        시작하기
      </h2>

      {/* 카드 컨테이너: 모바일 100% / 최대 454px */}
      <div
        className="
          mx-auto w-full max-w-[454px]
          rounded-xl bg-[#212225]
          p-5 sm:p-7
          text-gray-200 shadow-[0_8px_16px_rgba(0,0,0,0.25)]
        "
      >
        <h3 className="text-[13px] sm:text-base font-semibold text-white">
          나(사장님)은?
        </h3>

        <ul className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
          {OPTIONS.map((label) => {
            const selected = isSelected(label);
            return (
              <li
                key={label}
                onClick={() => handleClick(label)}
                className={[
                  "flex items-center gap-3 cursor-pointer rounded-md px-3 py-3 sm:py-3.5 transition",
                  selected
                    ? "bg-white/5 text-white"
                    : "text-gray-300 hover:text-white/90",
                ].join(" ")}
              >
                <span
                  className={[
                    "shrink-0",
                    "text-base sm:text-lg",
                    selected ? "text-emerald-400" : "text-gray-500",
                  ].join(" ")}
                >
                  ✓
                </span>
                <span className="text-[12px] sm:text-[12px] md:text-[10px]">
                  {label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
