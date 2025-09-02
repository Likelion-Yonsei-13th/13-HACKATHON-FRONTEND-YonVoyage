// src/app/(pages)/aistudio/components/SplitViewer.tsx
"use client";

import { useCallback, useRef, useState } from "react";

const LEFT_SRC_DEFAULT = "/img/mainpage/before.png";
const RIGHT_SRC_DEFAULT = "/img/mainpage/after.png";

type Props = {
  leftUrl?: string;
  rightUrl?: string;
  className?: string; // ← 추가
};

export function SplitViewer({ leftUrl, rightUrl, className }: Props) {
  const [x, setX] = useState(50);
  const ref = useRef<HTMLDivElement | null>(null);

  const drag = (clientX: number) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const nx = Math.min(
      101,
      Math.max(0, ((clientX - rect.left) / rect.width) * 100)
    );
    setX(nx);
  };

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (e.buttons !== 1) return;
    drag(e.clientX);
  }, []);
  const onTouchMove = useCallback((e: React.TouchEvent) => {
    drag(e.touches[0].clientX);
  }, []);

  const leftSrc = leftUrl || LEFT_SRC_DEFAULT;
  const rightSrc = rightUrl || RIGHT_SRC_DEFAULT;

  return (
    <div
      ref={ref}
      className={`relative w-full rounded-lg bg-[#181a1b] border border-white/10 overflow-hidden select-none ${
        className || ""
      }`}
      style={{ aspectRatio: "16 / 9" }}
      onMouseMove={onMouseMove}
      onTouchMove={onTouchMove}
    >
      <img
        src={leftSrc}
        alt="left"
        className="absolute inset-0 h-full w-full object-contain"
      />
      <img
        src={rightSrc}
        alt="right"
        className="absolute inset-0 h-full w-full object-contain"
        style={{ clipPath: `inset(0 0 0 ${x}%)` }}
      />
      <div
        className="absolute inset-y-0 cursor-ew-resize"
        style={{ left: `${x}%`, transform: "translateX(-50%)" }}
        onMouseDown={(e) => drag(e.clientX)}
        onTouchStart={(e) => drag(e.touches[0].clientX)}
      >
        <div className="h-full w-[2px] bg-white/80" />
        <div className="absolute top-1/2 -translate-y-1/2 -left-4 right-0 flex justify-center">
          <div className="rounded-full bg-white text-black text-xs px-2 py-1 shadow">
            ↔
          </div>
        </div>
      </div>
    </div>
  );
}
