// src/app/(pages)/aistudio/components/HistoryStrip.tsx
"use client";

import type { GeneratedImage } from "@/app/_common/apis/aistudio";

export const HISTORY_CAP = 5;

export default function HistoryStrip({
  items,
  onSelect,
}: {
  items: GeneratedImage[];
  onSelect?: (img: GeneratedImage) => void;
}) {
  const placeholders = Math.max(0, HISTORY_CAP - items.length);

  return (
    <div className="mt-8">
      <div className="flex gap-3 justify-end overflow-x-auto pb-1">
        {/* 빈 칸 (왼쪽에 먼저 렌더) */}
        {Array.from({ length: placeholders }).map((_, i) => (
          <div
            key={`ph-${i}`}
            className="relative h-20 w-24 shrink-0 rounded border border-white/10 overflow-hidden bg-neutral-800/50 grid place-items-end"
            title="Free slot"
          >
            {/* 빈 썸네일 느낌 */}
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.06)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.06)_50%,rgba(255,255,255,0.06)_75%,transparent_75%,transparent)] bg-[length:12px_12px]" />
            <span className="relative z-10 w-full text-center text-[11px] leading-[18px] bg-black/60 text-white">
              Free
            </span>
          </div>
        ))}

        {/* 실제 생성된 항목들(오른쪽부터 차도록 push 방식) */}
        {items.map((img) => (
          <button
            key={img.id}
            onClick={() => onSelect?.(img)}
            className="relative h-20 w-24 shrink-0 rounded border border-white/10 overflow-hidden hover:scale-[1.02] transition"
            title={img.prompt || img.id}
          >
            <img
              src={img.url}
              alt={img.id}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
