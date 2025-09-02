// src/app/(pages)/onboarding/page.tsx
"use client";

import { useState } from "react";
import Step1 from "./components/Step1";
import Step2 from "./components/Step2";
import Step3 from "./components/Step3";
import Step4 from "./components/Step4";
import Step5 from "./components/Step5";
import Step6 from "./components/Step6";
import UserInfo from "./components/UserInfo";
import type { StepProps } from "./components/types";
import {
  generateOnboardingImage,
  getGeneratedImage,
} from "@/app/_common/apis/onboarding";

function UserInfoStep(p: StepProps) {
  return (
    <section className="min-h-[60vh] flex flex-col items-center justify-center">
      <UserInfo {...p} />
    </section>
  );
}

const steps: Array<(p: StepProps) => JSX.Element> = [
  UserInfoStep, // 0
  Step1, // 1
  Step2, // 2
  Step3, // 3
  Step4, // 4 (업로드)
  Step5, // 5 (결과)
  Step6, // 6 (완료)
] as const;

const UPLOAD_STEP = 4;
const RESULT_STEP = 5;

type AnswerMap = Record<number, string | string[] | undefined>;

export default function OnboardingPage() {
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [submitting, setSubmitting] = useState(false);

  const Current = steps[i];
  const isLast = i === steps.length - 1;
  const isUploadStep = i === UPLOAD_STEP;

  const required = steps.map(() => true);
  required[UPLOAD_STEP] = false;
  required[RESULT_STEP] = false;

  const isArrayStep = i === 3;
  const isValid = required[i]
    ? isArrayStep
      ? Array.isArray(answers[i]) && (answers[i] as string[]).length > 0
      : Boolean(answers[i])
    : true;

  const isNextDisabled = isLast ? true : !isValid || submitting;
  const handleChange = (val: string | string[]) =>
    setAnswers((prev) => ({ ...prev, [i]: val }));
  const goPrev = () => setI((s) => Math.max(0, s - 1));

  const goNext = async () => {
    if (i === UPLOAD_STEP) {
      const uploadId = answers[UPLOAD_STEP] as string | undefined;
      if (!uploadId) {
        alert("이미지를 먼저 업로드 해 주세요.");
        return;
      }
      try {
        setSubmitting(true);

        // 1) 생성
        const { generated_image_id } = await generateOnboardingImage(uploadId);
        // 2) 결과 URL 조회
        const { url } = await getGeneratedImage(generated_image_id);
        // Step5 표시 값
        setAnswers((prev) => ({ ...prev, [RESULT_STEP]: url }));

        // ✅ 기존 브리지 유지 + 결과만 merge (uploadedUrl 보존)
        const prev = JSON.parse(
          localStorage.getItem("aistudio_bridge_last") || "{}"
        );
        localStorage.setItem(
          "aistudio_bridge_last",
          JSON.stringify({
            ...prev,
            generatedId: generated_image_id,
            url,
            ts: Date.now(),
          })
        );
      } catch (e) {
        console.error("[ONBOARDING goNext] 보정 실패:", e);
        alert("이미지 보정(생성)에 실패했습니다.");
        return;
      } finally {
        setSubmitting(false);
      }
    }

    setI((s) => Math.min(steps.length - 1, s + 1));
  };

  const CONTENT_MAX = 1920;

  return (
    <>
      <main>
        <div className="mx-auto w-full max-w-[960px] rounded-xl p-6 sm:p-8">
          <Current value={answers[i]} onChange={handleChange} />
        </div>
      </main>

      {!isLast && (
        <section className="mb-12">
          <div className="mx-auto w-[660px]" style={{ maxWidth: CONTENT_MAX }}>
            <div className="flex items-stretch gap-4 sm:gap-5">
              {!isUploadStep && (
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={i === 0 || submitting}
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
                {isUploadStep && submitting ? "보정 중…" : "다음"}
              </button>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
