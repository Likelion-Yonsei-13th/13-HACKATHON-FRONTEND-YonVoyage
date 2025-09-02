// src/app/(pages)/onboarding/layout.tsx
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
      <header className="w-full">
        <div className="app-shell">
          <TopBar />
        </div>
      </header>

      <main className="flex-1 w-full">
        <div className="app-shell px-6 sm:px-10 lg:px-16">{children}</div>
      </main>

      <footer className="w-full mt-10">
        <UnderBar />
      </footer>
    </div>
  );
}
