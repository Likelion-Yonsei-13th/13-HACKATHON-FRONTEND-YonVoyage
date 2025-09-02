// src/app/(pages)/onboarding/components/Step2.tsx
import type { StepProps } from "./types";

const OPTIONS = ["원해요", "원치않아요"];

export default function Step2({ value, onChange }: StepProps) {
  return (
    <section className="min-h-[60vh] w-full flex flex-col items-center justify-center gap-6 px-4">
      {/* 타이틀 */}
      <h2 className="text-white text-[15px] sm:text-xl font-bold text-center">
        내 플레이팅의 문제점을 진단받기
      </h2>

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
            const selected = value === label;
            return (
              <li
                key={label}
                onClick={() => onChange?.(label)}
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
