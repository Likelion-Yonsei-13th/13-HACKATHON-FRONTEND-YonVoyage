// src/app/onboarding/components/Step1.tsx
import type { StepProps } from "./types";

const OPTIONS = [
  "AI 초수",
  "AI 중수 (1~6개월 1번)",
  "AI 고수 (주 3회 이상 활용)",
];

export default function Step1({ value, onChange }: StepProps) {
  return (
    <section className="min-h-[60vh] flex flex-col justify-center gap-6">
      <h2 className="text-xl font-semibold">나(사장님)은?</h2>

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
