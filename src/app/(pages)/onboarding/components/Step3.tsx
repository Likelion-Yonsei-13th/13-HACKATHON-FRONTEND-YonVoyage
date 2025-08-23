import type { StepProps } from "./types";

const OPTIONS = ["기본보정(색상,밝기)", "배치(음식 구도, 크기)", "컨셉보강"];

export default function Step3({ value, onChange }: StepProps) {
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
          width: "454px", // 고정 너비
          height: "356px", // 고정 높이
          minWidth: "280px", // 최소 너비
          borderRadius: "12px", // 모서리
          backgroundColor: "rgba(33, 34, 37, 100)", // 카드 색상
          padding: "32px", // 전체 padding
          paddingBottom: "32px", // 하단 padding
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
              {/* 선택된 경우 체크 마크 */}
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
