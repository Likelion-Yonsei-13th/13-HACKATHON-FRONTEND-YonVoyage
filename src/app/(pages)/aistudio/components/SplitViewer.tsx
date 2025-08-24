"use client";

import { useCallback, useRef, useState } from "react";

export function SplitViewer({
  leftUrl,
  rightUrl,
}: {
  leftUrl?: string;
  rightUrl?: string;
}) {
  const [x, setX] = useState(50); // %
  const ref = useRef<HTMLDivElement | null>(null);

  const drag = (clientX: number) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const nx = Math.min(
      100,
      Math.max(0, ((clientX - rect.left) / rect.width) * 100)
    );
    setX(nx);
  };

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (e.buttons !== 1) return; // 드래그 중만
    drag(e.clientX);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    drag(e.touches[0].clientX);
  }, []);

  return (
    <div
      ref={ref}
      className="relative w-full rounded-lg bg-[#181a1b] border border-white/10 overflow-hidden select-none"
      style={{ aspectRatio: "16 / 9" }}
      onMouseMove={onMouseMove}
      onTouchMove={onTouchMove}
    >
      {/* left */}
      {leftUrl ? (
        <img
          src={leftUrl}
          alt="uploaded"
          className="absolute inset-0 h-full w-full object-contain"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center text-sm text-white/40">
          업로드 이미지 없음
        </div>
      )}

      {/* right with clip */}
      {rightUrl && (
        <img
          src={rightUrl}
          alt="generated"
          className="absolute inset-0 h-full w-full object-contain"
          style={{ clipPath: `inset(0 0 0 ${x}%)` }}
        />
      )}

      {/* center handle */}
      <div
        className="absolute inset-y-0"
        style={{ left: `${x}%`, transform: "translateX(-50%)" }}
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
