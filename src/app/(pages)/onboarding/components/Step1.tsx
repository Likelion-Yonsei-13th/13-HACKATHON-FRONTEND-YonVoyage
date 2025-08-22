import type { StepProps } from "./types";

const OPTIONS = [
  "AI 초수",
  "AI 중수 (1~6개월 1번)",
  "AI 고수 (주 3회 이상 활용)",
];

export default function Step1({ value, onChange }: StepProps) {
  return (
    <section className="min-h-[60vh] flex flex-col items-center justify-center gap-8">
      <h2 className="text-2xl font-bold text-white">나(사장님)은?</h2>

      {/* 카드 */}
      <div
        className="rounded-lg text-gray-200"
        style={{
          width: "454px",
          height: "356px",
          minWidth: "280px",
          borderRadius: "12px",
          backgroundColor: "rgba(33, 34, 37, 1)", // ← 알파 1 로 수정
          padding: "32px",
        }}
      >
        <ul className="space-y-4 mt-8">
          {OPTIONS.map((label) => (
            <li
              key={label}
              onClick={() => onChange(label)}
              className={[
                "flex items-center gap-3 cursor-pointer transition",
                value === label ? "text-white" : "text-gray-400",
              ].join(" ")}
            >
              <span
                className={`text-lg ${
                  value === label ? "text-green-400" : "text-gray-500"
                }`}
              >
                ✓
              </span>
              <span>{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
