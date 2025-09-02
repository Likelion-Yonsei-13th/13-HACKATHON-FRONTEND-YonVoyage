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
      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-gray-200 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition"
    >
      {/* 체크표시 → 회색 고정 */}
      <span className="text-lg text-gray-400">✓</span>
      <span>{children}</span>
    </button>
  );

  return (
    <section className="min-h-[60vh] flex flex-col items-center justify-center gap-8">
      {/* 타이틀 */}
      <h2 className="text-2xl font-bold text-white">픽플 이용하기</h2>

      {/* 카드 */}
      <div
        className="rounded-lg text-gray-200"
        style={{
          width: "454px",
          height: "356px",
          minWidth: "280px",
          borderRadius: "12px",
          backgroundColor: "rgba(33, 34, 37, 1)",
          padding: "32px",
        }}
      >
        <div className="space-y-3">
          <Row onClick={() => router.push("/mainpage")}>끝내기</Row>
          <Row onClick={() => router.push("/aistudio")}>더 해볼래요!</Row>
        </div>
      </div>
    </section>
  );
}
