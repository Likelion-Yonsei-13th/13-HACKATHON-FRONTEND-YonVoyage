// src/app/(pages)/onboarding/components/Step6.tsx
"use client";

import { useRouter } from "next/navigation";
import type { StepProps } from "./types";

export default function Step6(_: StepProps) {
  const router = useRouter();

  const Row = ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className="
        flex w-full items-center gap-3
        rounded-md px-3 py-3
        text-left text-gray-200
        hover:bg-white/5
        focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500
        transition
      "
    >
      <span className="text-base sm:text-lg text-gray-400">✓</span>
      <span className="text-[13px] sm:text-sm">{children}</span>
    </button>
  );

  return (
    <section className="min-h-[60vh] w-full flex flex-col items-center justify-center gap-6 px-4">
      {/* 타이틀(반응형) */}
      <h2 className="text-white text-[15px] sm:text-xl font-bold text-center">
        픽플 이용하기
      </h2>

      {/* 카드 컨테이너 (통일 규격) */}
      <div
        className="
          mx-auto w-full max-w-[454px]
          rounded-xl bg-[#212225]
          p-5 sm:p-7
          text-gray-200
          shadow-[0_8px_16px_rgba(0,0,0,0.25)]
        "
      >
        <div className="space-y-3">
          <Row onClick={() => router.push("/mainpage")}>끝내기</Row>
          <Row onClick={() => router.push("/aistudio")}>더 해볼래요!</Row>
        </div>
      </div>
    </section>
  );
}
