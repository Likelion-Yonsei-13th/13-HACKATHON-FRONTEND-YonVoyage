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
      <TopBar />

      <main className="flex-1 w-full">
        <div className="app-shell">{children}</div>
      </main>

      <UnderBar />
    </div>
  );
}
