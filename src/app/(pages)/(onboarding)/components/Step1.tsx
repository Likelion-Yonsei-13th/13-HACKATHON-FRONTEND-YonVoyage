// src/app/(pages)/onboarding/components/Step1.tsx
"use client";

import type { StepProps } from "./types";
import UserInfo from "./UserInfo";

const OPTIONS = [
  "AI 초수",
  "AI 중수 (1~6개월 1번)",
  "AI 고수 (주 3회 이상 활용)",
];

export default function Step1({ value, onChange }: StepProps) {
  // (선택) value가 string[]일 수도 있으니 선택 여부 안전하게 계산
  const isSelected = (label: string) =>
    Array.isArray(value) ? value.includes(label) : value === label;

  return (
    <section className="min-h-[60vh] flex flex-col items-center justify-center gap-8">
      <h2 className="text-2xl font-bold text-white">시작하기</h2>

      <div
        className="rounded-lg text-gray-200"
        style={{
          width: "454px",
          minWidth: "280px",
          borderRadius: "12px",
          backgroundColor: "rgba(33, 34, 37, 1)",
          padding: "32px",
        }}
      >
        <h3 className="text-base font-semibold text-white">나(사장님)은?</h3>

        <ul className="space-y-4 mt-6">
          {OPTIONS.map((label) => {
            const selected = isSelected(label);
            return (
              <li
                key={label}
                onClick={() => onChange?.(label)}
                className={[
                  "flex items-center gap-3 cursor-pointer transition",
                  selected ? "text-white" : "text-gray-400",
                ].join(" ")}
              >
                <span
                  className={`text-lg ${
                    selected ? "text-green-400" : "text-gray-500"
                  }`}
                >
                  ✓
                </span>
                <span>{label}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
