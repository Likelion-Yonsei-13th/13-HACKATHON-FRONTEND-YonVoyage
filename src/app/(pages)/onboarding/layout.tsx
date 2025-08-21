// src/app/onboarding/layout.tsx
import Link from "next/link";
import BackButton from "./BackButton";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 회색 배경 + 가운데 정렬
    <div className="min-h-[100dvh] bg-neutral-700 flex items-start sm:items-center justify-center p-4">
      {/* 모바일 카드 프레임 */}
      <div
        className="relative w-full bg-white rounded-2xl shadow-2xl"
        style={{
          maxWidth: "var(--app-max-w)", // ex) 500px
          minWidth: "var(--app-min-w)", // ex) 320px
        }}
      >
        {/* 콘텐츠 영역: 상단/하단 여유 */}
        <div className="min-h-[100dvh] px-5 pt-6 pb-[96px]">{children}</div>
      </div>
    </div>
  );
}
