// src/app/(pages)/onboarding/page.tsx
"use client";

import { JSX, useState } from "react";
import Step1 from "./components/Step1";
import Step2 from "./components/Step2";
import Step3 from "./components/Step3";
import Step4 from "./components/Step4"; // 업로드만 수행(answers[UPLOAD_STEP] = uploadId)
import Step5 from "./components/Step5";
import Step6 from "./components/Step6";
import UserInfo from "./components/UserInfo"; // 닉네임/uuid 등록 카드

// import ProgressBar from "./components/Progressbar";
import type { StepProps } from "./components/types";
import {
  generateOnboardingImage,
  getGeneratedImage,
} from "@/app/_common/apis/onboarding";

/** UserInfo 컴포넌트를 Step 형태로 감싼 래퍼 (StepProps 시그니처 맞추기) */
function UserInfoStep(_: StepProps) {
  return (
    <section className="min-h-[60vh] flex flex-col items-center justify-center">
      <UserInfo />
    </section>
  );
}

/** steps 정의 (UserInfo가 0번째) */
const steps: Array<(p: StepProps) => JSX.Element> = [
  UserInfoStep, // 0: 닉네임/uuid 등록
  Step1, // 1: 숙련도
  Step2, // 2
  Step3, // 3
  Step4, // 4: 업로드(answers[4] = uploadId)
  Step5, // 5: 결과 표시(answers[5] = resultUrl)
  Step6, // 6: 완료
] as const;

/** 인덱스 상수 */
const UPLOAD_STEP = 4; // Step4
const RESULT_STEP = 5; // Step5

// 필수 여부
const required = steps.map(() => true);
// UserInfoStep은 자체 버튼으로 처리하므로 필수 검사 제외
required[0] = false;
// 업로드/결과 스텝은 다음 버튼에서 직접 처리하므로 필수 검사 제외
required[UPLOAD_STEP] = false;
required[RESULT_STEP] = false;

type AnswerMap = Record<number, string | string[] | undefined>;

export default function OnboardingPage() {
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [submitting, setSubmitting] = useState(false);

  const Current = steps[i];
  const isLast = i === steps.length - 1;
  const isUploadStep = i === UPLOAD_STEP;

  // 유효성(기존 로직 유지: Step3 복수선택 고려)
  const isArrayStep = i === 3; // 복수선택 스텝 인덱스가 3이라면 유지
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
    // 업로드 스텝 → 다음(결과 스텝)으로 넘어갈 때: 생성 → 결과 조회 → URL 저장
    if (i === UPLOAD_STEP) {
      const uploadId = answers[UPLOAD_STEP] as string | undefined;
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

        // Step5에서 사용할 결과 이미지 URL 저장
        setAnswers((prev) => ({ ...prev, [RESULT_STEP]: url }));

        // 브리지 저장 (AI Studio에서 초기 선택 및 스트립 머지에 사용)
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
              {/* 업로드 스텝에서는 '이전'을 숨기는 기존 UX를 유지하려면 아래 조건 유지 */}
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
