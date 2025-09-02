// src/app/(pages)/aistudio/components/HistoryStrip.tsx
"use client";

import type { GeneratedImage } from "@/app/_common/apis/aistudio";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

function toAbsolute(u?: string) {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  return API_BASE ? `${API_BASE}${u.startsWith("/") ? "" : "/"}${u}` : u;
}

function normalizeForImg(u?: string) {
  if (!u) return "";
  const abs = toAbsolute(u);
  // https는 직통, http/상대경로는 프록시 경유
  if (/^https:\/\//i.test(abs)) return abs;
  return `/api/proxy-image?u=${encodeURIComponent(abs)}`;
}

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
        {Array.from({ length: placeholders }).map((_, i) => (
          <div
            key={`ph-${i}`}
            className="relative h-20 w-24 shrink-0 rounded border border-white/10 overflow-hidden bg-neutral-800/50 grid place-items-end"
            title="Free slot"
          >
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.06)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.06)_50%,rgba(255,255,255,0.06)_75%,transparent_75%,transparent)] bg-[length:12px_12px]" />
            <span className="relative z-10 w-full text-center text-[11px] leading-[18px] bg-black/60 text-white">
              Free
            </span>
          </div>
        ))}

        {items.map((img) => (
          <button
            key={img.id}
            onClick={() => onSelect?.(img)}
            className="relative h-20 w-24 shrink-0 rounded border border-white/10 overflow-hidden hover:scale-[1.02] transition"
            title={img.prompt || img.id}
          >
            <img
              src={normalizeForImg(img.url)}
              alt={img.id}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
