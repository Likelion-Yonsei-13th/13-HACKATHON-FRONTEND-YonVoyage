import type { ReactNode } from "react";

export default function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    // 사이트 전체 배경: 공백 없는 임의값 or 헥스 사용
    <div className="min-h-dvh w-full bg-[rgba(20,20,21,1)] text-white">
      {/* 가운데 스테이지도 동일 색으로 통일 */}
      <div
        className={[
          "mx-auto w-full min-h-dvh px-6 sm:px-10 lg:px-16",
          "max-w-[1920px] xl:min-w-[1280px]",
          "py-10 lg:py-12",
          "bg-[#141415]",
        ].join(" ")}
      >
        {/* 하단 바가 absolute로 붙을 기준 */}
        <main className="relative mx-auto w-full max-w-[960px]">
          {children}
        </main>
      </div>
    </div>
  );
}
