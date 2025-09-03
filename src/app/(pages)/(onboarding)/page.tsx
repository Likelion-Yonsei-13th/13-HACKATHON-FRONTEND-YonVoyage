"use client";

import { JSX, useState } from "react";
import Step1 from "./components/Step1";
import Step2 from "./components/Step2";
import Step3 from "./components/Step3";
import Step4 from "./components/Step4";
import Step5 from "./components/Step5";
import Step6 from "./components/Step6";
import UserInfo from "./components/UserInfo";
import type { StepProps } from "./components/types";
import StepNav from "./components/StepNav";
// ✅ 재생성 금지: generateOnboardingImage import 제거
import { getGeneratedImage } from "@/app/_common/apis/onboarding";

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
  Step4, // 4 (업로드+생성까지 진행)
  Step5, // 5 (결과 표시)
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

  // 필수 응답 여부(업로드/결과 스텝은 선택)
  const required = steps.map(() => true);
  required[UPLOAD_STEP] = false;
  required[RESULT_STEP] = false;

  const isArrayStep = i === 3; // Step3만 다중 선택
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
    // ✅ Step4에서는 "재생성" 금지. Step4가 이미 생성까지 완료하고
    //    localStorage('aistudio_bridge_last')에 generatedId/url을 저장함.
    if (i === UPLOAD_STEP) {
      try {
        setSubmitting(true);

        const bridge = JSON.parse(
          localStorage.getItem("aistudio_bridge_last") || "{}"
        );

        // 1) 브리지에 생성 결과가 있으면 그걸로 진행
        let url: string | undefined =
          typeof bridge?.url === "string" && bridge.url.trim().length > 0
            ? bridge.url.trim()
            : undefined;

        // 2) 혹시 Step4가 value로 url을 emit한 경우 answers[UPLOAD_STEP]에 이미 url이 있을 수 있음
        if (!url) {
          const fromAnswer = answers[UPLOAD_STEP];
          if (
            typeof fromAnswer === "string" &&
            /^https?:\/\//i.test(fromAnswer)
          ) {
            url = fromAnswer;
          }
        }

        // 3) 그래도 url이 없다면, generatedId로 조회 폴백
        if (
          !url &&
          typeof bridge?.generatedId === "string" &&
          bridge.generatedId
        ) {
          try {
            const { url: fetched } = await getGeneratedImage(
              bridge.generatedId
            );
            url = fetched;
          } catch (e) {
            console.warn("[ONBOARDING goNext] getGeneratedImage 폴백 실패:", e);
          }
        }

        // 4) 여전히 없으면 안내
        if (!url) {
          console.error(
            "[ONBOARDING goNext] 생성 결과 URL 없음. bridge:",
            bridge
          );
          alert(
            "생성 결과가 준비되지 않았어요. 이미지를 다시 업로드해 주세요."
          );
          setSubmitting(false);
          return;
        }

        // Step5(결과) 표시용 값 저장
        setAnswers((prev) => ({ ...prev, [RESULT_STEP]: url }));

        // 브리지도 최신화(선택)
        localStorage.setItem(
          "aistudio_bridge_last",
          JSON.stringify({
            ...bridge,
            url,
            ts: Date.now(),
          })
        );
      } catch (e) {
        console.error("[ONBOARDING goNext] 결과 준비 실패:", e);
        alert("결과를 준비하는 중 문제가 발생했어요.");
        setSubmitting(false);
        return;
      } finally {
        setSubmitting(false);
      }
    }

    setI((s) => Math.min(steps.length - 1, s + 1));
  };

  return (
    <>
      <main>
        {/* 본문 컨테이너: 960px까지 중앙 정렬 + 반응형 패딩 */}
        <div className="mx-auto w-full max-w-[960px] rounded-xl p-6 sm:p-8">
          <Current value={answers[i]} onChange={handleChange} />
        </div>
      </main>

      {/* 하단 내비게이션 */}
      {!isLast && (
        <StepNav
          showPrev={!isUploadStep}
          onPrev={goPrev}
          onNext={goNext}
          prevDisabled={i === 0 || submitting}
          nextDisabled={isNextDisabled}
          nextLabel="다음"
          loadingLabel="보정 중…"
          // ✅ Step4에서만 로딩 스피너 노출
          loading={isUploadStep && submitting}
        />
      )}
    </>
  );
}
