// src/app/onboarding/page.tsx
"use client";

import { useState } from "react";
import Step1 from "./components/Step1";
import Step2 from "./components/Step2";
import Step3 from "./components/Step3";
import Step4 from "./components/Step4";
import Step5 from "./components/Step5";
// 필요 시 Step6~Step10 import

type AnswerMap = Record<number, string | undefined>;

// 스텝 컴포넌트들 (모두 StepProps 시그니처를 만족)
const steps = [Step1, Step2, Step3, Step4, Step5] as const;

// 각 단계가 “선택 필수”인지(모두 true면 전체가 필수)
const required = steps.map(() => true);

export default function OnboardingPage() {
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});

  const Current = steps[i];

  const isValid = required[i] ? Boolean(answers[i]) : true;

  const handleChange = (val: string) =>
    setAnswers((prev) => ({ ...prev, [i]: val }));

  return (
    <>
      {/* 본문 */}
      <div className="space-y-6">
        <Current value={answers[i]} onChange={handleChange} />
      </div>

      {/* 하단 버튼 바: 카드 안쪽에 고정 (layout.tsx의 relative 컨테이너 기준) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 rounded-b-2xl bg-white/95 border-t p-4">
        <div className="pointer-events-auto grid grid-cols-2 gap-3">
          <button
            className="h-12 rounded bg-gray-200 disabled:opacity-50"
            onClick={() => setI((s) => Math.max(0, s - 1))}
            disabled={i === 0}
          >
            이전
          </button>
          <button
            className="h-12 rounded bg-gray-800 text-white disabled:opacity-50"
            onClick={() => setI((s) => Math.min(steps.length - 1, s + 1))}
            disabled={!isValid}
          >
            다음
          </button>
        </div>
        <div className="mt-2 text-center text-xs text-gray-500">
          {i + 1} / {steps.length}
        </div>
      </div>
    </>
  );
}
