// src/app/(pages)/onboarding/components/Step3.tsx
"use client";

import type { StepProps } from "./types";

const OPTIONS = ["기본보정(색상,밝기)", "배치(음식 구도, 크기)", "컨셉보강"];

export default function Step3({ value, onChange }: StepProps) {
  // 멀티 선택 전용
  const selected: string[] = Array.isArray(value) ? value : [];
  const emit = onChange ?? (() => {});

  const toggle = (label: string) => {
    emit(
      selected.includes(label)
        ? selected.filter((v) => v !== label)
        : [...selected, label]
    );
  };

  return (
    <section className="min-h-[60vh] w-full flex flex-col items-center justify-center gap-6 px-4">
      {/* 타이틀 */}
      <h2 className="text-white text-[15px] sm:text-xl font-bold text-center">
        픽플 요청사항을 골라주세요
      </h2>

      {/* 카드 컨테이너 (Step2와 동일 규격) */}
      <div
        className="
          mx-auto w-full max-w-[454px]
          rounded-xl bg-[#212225]
          p-5 sm:p-7
          text-gray-200 shadow-[0_8px_16px_rgba(0,0,0,0.25)]
        "
      >
        <ul className="mt-2 space-y-2 sm:space-y-3">
          {OPTIONS.map((label) => {
            const active = selected.includes(label);
            return (
              <li
                key={label}
                role="checkbox"
                aria-checked={active}
                tabIndex={0}
                onClick={() => toggle(label)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggle(label);
                  }
                }}
                className={[
                  "flex items-center gap-3 cursor-pointer select-none rounded-md px-3 py-3 sm:py-3.5 transition",
                  active
                    ? "bg-white/5 text-white"
                    : "text-gray-300 hover:text-white/90",
                ].join(" ")}
              >
                <span
                  className={[
                    "shrink-0",
                    "text-base sm:text-lg",
                    active ? "text-emerald-400" : "text-gray-500",
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
