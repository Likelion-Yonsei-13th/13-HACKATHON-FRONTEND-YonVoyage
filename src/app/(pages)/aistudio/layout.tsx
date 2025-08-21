// src/app/(pages)/aistudio/layout.tsx
import React from "react";
import "../../globals.css"; // 필요하면 경로 맞춰주세요

export default function AiStudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 회색 배경 + 가운데 정렬
    <div className="min-h-[100dvh] bg-neutral-700 flex justify-center p-4">
      {/* 모바일 카드 프레임 */}
      <div
        className="relative w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{
          maxWidth: "var(--app-max-w, 500px)", // 500px 기본
          minWidth: "var(--app-min-w, 320px)", // 320px 기본
        }}
      >
        {/* 본문 */}
        <main className="min-h-[100dvh] px-5 pt-6 pb-[88px]">{children}</main>
      </div>
    </div>
  );
}
