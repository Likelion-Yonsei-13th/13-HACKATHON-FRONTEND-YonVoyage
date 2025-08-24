// src/app/(pages)/onboarding/page.tsx
"use client";

import { useState } from "react";
import Step1 from "./components/Step1";
import Step2 from "./components/Step2";
import Step3 from "./components/Step3";
import Step4 from "./components/Step4"; // 업로드만 수행(answers[3] = uploadId)
import Step5 from "./components/Step5"; // resultUrl 표시
import Step6 from "./components/Step6";
// import ProgressBar from "./components/Progressbar";
import type { StepProps } from "./components/types";
import {
  generateOnboardingImage,
  getGeneratedImage,
} from "@/app/_common/apis/onboarding";

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
// Step4(업로드)는 '다음'에서 직접 검사/요청하므로 필수 체크 제외
required[3] = false;
required[4] = false;

type AnswerMap = Record<number, string | string[] | undefined>;

export default function OnboardingPage() {
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [submitting, setSubmitting] = useState(false);

  const Current = steps[i];
  const isLast = i === steps.length - 1;
  const isStep4 = i === 3;

  // 유효성(기존 로직 유지: Step3 복수선택 고려)
  const isArrayStep = i === 2;
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
    // Step4 → Step5로 넘어갈 때: 업로드ID로 생성 요청 → 생성ID로 결과 조회 → Step5에 URL 전달
    if (i === 3) {
      const uploadId = answers[3] as string | undefined;
      if (!uploadId) {
        alert("이미지를 먼저 업로드 해 주세요.");
        return;
      }

      try {
        setSubmitting(true);

        // 1) 보정(생성) 요청 → generated_image_id 획득
        const { generated_image_id } = await generateOnboardingImage(uploadId);
        // 2) 생성ID로 최종 결과 이미지 조회
        const { url } = await getGeneratedImage(generated_image_id);

        // Step5에서 사용할 결과 이미지 URL 저장 (answers[4])
        setAnswers((prev) => ({ ...prev, 4: url }));

        // 2) 브리지 저장 (AI Studio에서 읽을 값)
        const bridge = { generatedId: generated_image_id, url, ts: Date.now() };
        localStorage.setItem("aistudio_bridge_last", JSON.stringify(bridge));
      } catch (e) {
        console.error("[ONBOARDING goNext] 보정 실패:", e);
        alert("이미지 보정(생성)에 실패했습니다.");
        return; // 실패 시 다음 단계로 이동하지 않음
      } finally {
        setSubmitting(false);
      }
    }

    setI((s) => Math.min(steps.length - 1, s + 1));
  };

  const CONTENT_MAX = 1920;

  return (
    <>
      {/* 필요하면 진행바 사용
      <section>
        <div className="mx-auto w-[450px]" style={{ maxWidth: CONTENT_MAX }}>
          <ProgressBar current={i} total={steps.length} />
        </div>
      </section> */}

      <main>
        <div className="mx-auto w-full max-w-[960px] rounded-xl p-6 sm:p-8">
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
                {i === 3 && submitting ? "보정 중…" : "다음"}
              </button>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
