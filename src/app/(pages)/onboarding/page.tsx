// src/app/onboarding/page.tsx
"use client";

import { useState } from "react";
import Step1 from "./components/Step1";
import Step2 from "./components/Step2";
import Step3 from "./components/Step3";
import Step4 from "./components/Step4";
import Step5 from "./components/Step5";
import ProgressBar from "./components/Progressbar";

const steps = [Step1, Step2, Step3, Step4, Step5] as const;
type AnswerMap = Record<number, string | undefined>;

export default function OnboardingPage() {
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const Current = steps[i];

  const isStep4 = i === 3; // Step4 화면
  const isLast = i === steps.length - 1;

  // Step4는 무조건 활성화, 그 외는 answers[i] 유무 체크
  const isNextDisabled = isStep4 ? false : !Boolean(answers[i]);

  return (
    <>
      {/* 상단: 프로그레스바 */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur py-3">
        <ProgressBar current={i} total={steps.length} />
      </div>

      {/* 본문 */}
      <div className="space-y-6">
        <Current
          value={answers[i]}
          onChange={(val: string) =>
            setAnswers((prev) => ({ ...prev, [i]: val }))
          }
        />
      </div>

      {/* 하단 버튼 바 */}
      {!isLast && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 rounded-b-2xl bg-white/95 border-t p-4">
          <div
            className={`pointer-events-auto grid gap-3 ${
              isStep4 ? "grid-cols-1" : "grid-cols-2"
            }`}
          >
            {!isStep4 && (
              <button
                className="h-12 rounded bg-gray-200 disabled:opacity-50"
                onClick={() => setI((s) => Math.max(0, s - 1))}
                disabled={i === 0}
              >
                이전
              </button>
            )}

            <button
              className="h-12 rounded bg-gray-800 text-white disabled:opacity-50"
              onClick={() => setI((s) => Math.min(steps.length - 1, s + 1))}
              disabled={isNextDisabled}
            >
              다음
            </button>
          </div>

          <div className="mt-2 text-center text-xs text-gray-500">
            {i + 1} / {steps.length}
          </div>
        </div>
      )}
    </>
  );
}
