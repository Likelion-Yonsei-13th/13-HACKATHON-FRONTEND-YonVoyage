// src/app/(pages)/onboarding/components/Step3.tsx
"use client";

import { useEffect } from "react";
import type { StepProps } from "./types";

const OPTIONS = [
  "기본보정(색상,밝기)",
  "배치(음식 구도, 크기)",
  "컨셉보강",
] as const;

// 한글 라벨 → 백엔드 옵션 키 매핑
const LABEL_TO_OPTION: Record<(typeof OPTIONS)[number], string> = {
  "기본보정(색상,밝기)": "basic",
  "배치(음식 구도, 크기)": "composition",
  컨셉보강: "concept",
};

export default function Step3({ value, onChange }: StepProps) {
  // 멀티 선택(라벨 배열로 유지)
  const selected: string[] = Array.isArray(value) ? value : [];
  const emit = onChange ?? (() => {});

  // 선택 변경시: 부모에 라벨 배열 전달 + 브리지에 슬러그 저장
  const persistSelection = (labels: string[]) => {
    emit(labels);

    // 라벨 → 슬러그 변환
    const options = labels
      .map((label) => LABEL_TO_OPTION[label as (typeof OPTIONS)[number]])
      .filter(Boolean);

    // 브리지에 동기화 (다음 단계에서 generate 호출 시 사용)
    const prev = JSON.parse(
      localStorage.getItem("aistudio_bridge_last") || "{}"
    );
    const next = {
      ...prev,
      options, // ✅ 백엔드가 읽는 키
      options_labels: labels, // 디버그/표시용
      ts: Date.now(),
    };
    localStorage.setItem("aistudio_bridge_last", JSON.stringify(next));
    // 디버그
    // console.log("[Step3] bridge saved:", next);
  };

  const toggle = (label: string) => {
    const next = selected.includes(label)
      ? selected.filter((v) => v !== label)
      : [...selected, label];
    persistSelection(next);
  };

  // 초기 마운트 시에도 브리지에 동기화(뒤로가기로 돌아왔을 때 대비)
  useEffect(() => {
    if (selected.length) persistSelection(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="min-h-[60vh] w-full flex flex-col items-center justify-center gap-6 px-4">
      <h2 className="text-white text-[15px] sm:text-xl font-bold text-center">
        픽플 요청사항을 골라주세요
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
