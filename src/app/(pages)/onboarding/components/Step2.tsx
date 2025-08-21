// src/app/onboarding/components/Step2.tsx
import type { StepProps } from "./types";

const OPTIONS = ["원해요", "원치않아요"];

export default function Step2({ value, onChange }: StepProps) {
  return (
    <section className="min-h-[60vh] flex flex-col justify-center gap-6">
      <h2 className="text-xl font-semibold">내 플레이팅의 문제점 진단받기</h2>
      <div className="flex flex-col gap-4 text-gray-700">
        {OPTIONS.map((label) => (
          <button
            key={label}
            onClick={() => onChange(label)}
            className={[
              "block w-full rounded-lg border p-3 text-left hover:bg-gray-100 transition",
              value === label ? "bg-gray-200 border-gray-500" : "bg-white",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}
