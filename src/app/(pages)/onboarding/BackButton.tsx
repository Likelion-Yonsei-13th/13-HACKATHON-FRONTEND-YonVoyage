// src/app/onboarding/BackButton.tsx
"use client";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="px-2 py-1 text-sm text-gray-600"
    >
      ← 뒤로
    </button>
  );
}
