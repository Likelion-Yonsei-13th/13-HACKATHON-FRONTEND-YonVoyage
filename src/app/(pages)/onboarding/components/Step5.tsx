// src/app/onboarding/components/Step5.tsx
"use client";

import { useRouter } from "next/navigation";

export default function Step5({
  value, // 시그니처만 맞춰둠 (안 써도 OK)
  onChange, // 시그니처만 맞춰둠 (안 써도 OK)
}: {
  value?: string;
  onChange: (v: string) => void;
}) {
  const router = useRouter();

  const markDone = () => {
    // 선택: 온보딩 완료 플래그 저장 (다음 접속 시 건너뛰기용)
    try {
      localStorage.setItem("onboarding_done", "1");
    } catch {}
  };

  const goHome = () => {
    markDone();
    // 메인으로
    router.replace("/"); // replace: 히스토리에 남기지 않고 교체
  };

  const goAIStudio = () => {
    markDone();
    // AI 스튜디오로
    router.replace("/aistudio");
  };

  return (
    <section className="min-h-[60vh] flex flex-col justify-center gap-10">
      <h2 className="text-2xl font-bold">픽플 이용하기</h2>

      <div className="flex flex-col gap-4">
        <button
          onClick={goAIStudio}
          className="h-12 rounded bg-gray-900 text-white"
        >
          더해볼래요!
        </button>

        <button
          onClick={goHome}
          className="h-12 rounded bg-gray-100 hover:bg-gray-200"
        >
          끝내기
        </button>
      </div>
    </section>
  );
}
