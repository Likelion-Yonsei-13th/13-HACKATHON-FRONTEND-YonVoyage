import type { ReactNode } from "react";
import TopBar from "@/app/_common/components/top-bar";
import UnderBar from "@/app/_common/components/under-bar";

export default function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-dvh flex flex-col bg-[#141415] text-white">
      {/* 상단바 */}
      <header className="w-full">
        <TopBar />
      </header>

      {/* 본문 */}
      <main className="flex-1 w-full px-6 sm:px-10 lg:px-16">{children}</main>

      {/* 하단바 */}
      <footer className="w-full mt-10">
        <UnderBar />
      </footer>
    </div>
  );
}
