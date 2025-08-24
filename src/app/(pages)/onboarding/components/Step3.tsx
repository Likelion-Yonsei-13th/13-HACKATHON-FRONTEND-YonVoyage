// src/app/(pages)/onboarding/components/Step3.tsx
"use client";

import type { StepProps } from "./types";

const OPTIONS = ["기본보정(색상,밝기)", "배치(음식 구도, 크기)", "컨셉보강"];

export default function Step3({ value, onChange }: StepProps) {
  // 값이 배열이 아니면 빈 배열로 취급(멀티 선택 전용)
  const selected = Array.isArray(value) ? value : [];

  const toggle = (label: string) => {
    if (selected.includes(label)) {
      onChange(selected.filter((v) => v !== label)); // 해제
    } else {
      onChange([...selected, label]); // 추가
    }
  };

  return (
    <section className="min-h-[60vh] flex flex-col items-center justify-center gap-8">
      {/* 타이틀 */}
      <h2 className="text-2xl font-bold text-white">
        픽플 요청사항을 골라주세요
      </h2>

      {/* 카드 */}
      <div
        className="rounded-lg text-gray-200"
        style={{
          width: "454px",
          height: "356px",
          minWidth: "280px",
          borderRadius: "12px",
          backgroundColor: "rgba(33,34,37,1)",
          padding: "32px",
          paddingBottom: "32px",
        }}
      >
        <ul className="space-y-4 mt-8">
          {OPTIONS.map((label) => {
            const active = selected.includes(label);
            return (
              <li
                key={label}
                onClick={() => toggle(label)}
                className={[
                  "flex items-center gap-3 cursor-pointer select-none transition",
                  active ? "text-white" : "text-gray-400",
                ].join(" ")}
              >
                {/* 체크 아이콘 (선택: 초록 ✓ / 미선택: 회색 ✓) */}
                <span
                  aria-hidden
                  className={`text-lg leading-none ${
                    active ? "text-green-400" : "text-gray-500"
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
