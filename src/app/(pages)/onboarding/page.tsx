// src/app/onboarding/page.tsx
"use client";

import { useState } from "react";
import Step1 from "./components/Step1";
import Step2 from "./components/Step2";
import Step3 from "./components/Step3";
import Step4 from "./components/Step4";
import Step5 from "./components/Step5";
import Step6 from "./components/Step6";
import ProgressBar from "./components/Progressbar";
import type { StepProps } from "./components/types";

// 모든 스텝 컴포넌트는 value / onChange를 받는 형태
const steps: Array<(p: StepProps) => JSX.Element> = [
  Step1,
  Step2,
  Step3,
  Step4,
  Step5,
  Step6,
] as const;

// 기본은 모두 필수(true). Step4, Step5는 선택 없이도 '다음' 가능(false).
const required = steps.map(() => true);
required[3] = false; // Step4
required[4] = false; // Step5

type AnswerMap = Record<number, string | undefined>;

export default function OnboardingPage() {
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});

  const Current = steps[i];
  const isLast = i === steps.length - 1;
  const isStep4 = i === 3;

  const isValid = required[i] ? Boolean(answers[i]) : true;
  const isNextDisabled = isLast ? true : !isValid;

  const handleChange = (val: string) =>
    setAnswers((prev) => ({ ...prev, [i]: val }));

  const goPrev = () => setI((s) => Math.max(0, s - 1));
  const goNext = () => setI((s) => Math.min(steps.length - 1, s + 1));

  // 버튼 사이 간격(px). Figma에 20px이면 20으로 두면 됨.
  const GAP_PX = 20;
  // 틈(스페이서) 배경색
  const GAP_COLOR = "rgba(20,20,21,1)";

  return (
    <>
      {/* 상단 진행 바 */}
      <div className="sticky top-0 z-10 bg-[rgba(20,20,21,1)] backdrop-blur py-3">
        <ProgressBar current={i} total={steps.length} />
      </div>
      {/* 본문 */}
      <div className="space-y-6">
        <Current value={answers[i]} onChange={handleChange} />
      </div>

      {!isLast && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 bg-[#141415]"
          style={{ backgroundColor: "#141415" }} // 퍼지/우선순위 대비
        >
          <div
            className="pointer-events-auto mx-auto w-full max-w-[1200px] px-6 md:px-10 py-3 bg-[#141415]"
            style={{ backgroundColor: "#141415" }}
          >
            <div
              className="flex items-stretch bg-[#141415]"
              style={{ backgroundColor: "#141415" }}
            >
              {/* 이전 버튼(4단계면 숨김) */}
              {!isStep4 && (
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={i === 0}
                  className="h-12 flex-1 rounded-md bg-neutral-700 text-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  이전
                </button>
              )}

              {/* 항상 렌더되는 스페이서(버튼 사이 틈 색을 강제) */}
              <div
                aria-hidden
                style={{
                  width: isStep4 ? 0 : 20, // Figma gap(20px). Step4는 0으로
                  backgroundColor: "rgba(20,20,21,1)",
                  transition: "width .2s ease",
                }}
              />

              {/* 다음 버튼 */}
              <button
                type="button"
                onClick={goNext}
                disabled={isNextDisabled}
                className="h-12 flex-1 rounded-md bg-emerald-500 text-white hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
