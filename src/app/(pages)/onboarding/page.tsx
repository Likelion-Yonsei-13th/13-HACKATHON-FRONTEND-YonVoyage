// src/app/(pages)/onboarding/page.tsx
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

const steps: Array<(p: StepProps) => JSX.Element> = [
  Step1,
  Step2,
  Step3,
  Step4,
  Step5,
  Step6,
] as const;

// 필수 여부
const required = steps.map(() => true);
required[3] = false;
required[4] = false;

type AnswerMap = Record<number, string | string[] | undefined>;

export default function OnboardingPage() {
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});

  const Current = steps[i];
  const isLast = i === steps.length - 1;
  const isStep4 = i === 3;

  const isArrayStep = i === 2;
  const isValid = required[i]
    ? isArrayStep
      ? Array.isArray(answers[i]) && (answers[i] as string[]).length > 0
      : Boolean(answers[i])
    : true;

  const isNextDisabled = isLast ? true : !isValid;

  const handleChange = (val: string | string[]) =>
    setAnswers((prev) => ({ ...prev, [i]: val }));

  const goPrev = () => setI((s) => Math.max(0, s - 1));
  const goNext = () => setI((s) => Math.min(steps.length - 1, s + 1));

  const CONTENT_MAX = 1920;

  return (
    <>
      {/* <section>
        <div className="mx-auto w-[450px]" style={{ maxWidth: CONTENT_MAX }}>
          <ProgressBar current={i} total={steps.length} />
        </div>
      </section> */}

      <main>
        <div className="mx-auto w-full max-w-[960px] rounded-xl   p-6 sm:p-8">
          <Current value={answers[i]} onChange={handleChange} />
        </div>
      </main>

      {!isLast && (
        <section className="mb-12">
          <div className="mx-auto w-[660px]" style={{ maxWidth: CONTENT_MAX }}>
            <div className="flex items-stretch gap-4 sm:gap-5">
              {!isStep4 && (
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={i === 0}
                  className="h-12 flex-1 rounded-md bg-neutral-700 text-neutral-200 transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  이전
                </button>
              )}
              <button
                type="button"
                onClick={goNext}
                disabled={isNextDisabled}
                className="h-12 flex-1 rounded-md bg-emerald-500 text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                다음
              </button>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
