// src/app/(pages)/aistudio/components/SplitViewer.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const isHttpUrl = (s?: string) => !!s && /^https?:\/\//i.test(s || "");
const isProxyUrl = (s?: string) => !!s && s.startsWith("/api/proxy-image");
const isBlobUrl = (s?: string) => !!s && s.startsWith("blob:");
const toProxy = (u: string) => `/api/proxy-image?u=${encodeURIComponent(u)}`;
function fromProxy(u: string): string | null {
  try {
    const url = new URL(
      u,
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost"
    );
    const raw = url.searchParams.get("u");
    return raw ? decodeURIComponent(raw) : null;
  } catch {
    return null;
  }
}

export function SplitViewer({
  leftUrl,
  rightUrl,
}: {
  leftUrl?: string;
  rightUrl?: string;
}) {
  const [x, setX] = useState(50);
  const ref = useRef<HTMLDivElement | null>(null);

  const [leftSrc, setLeftSrc] = useState<string | undefined>(leftUrl);
  const [leftTried, setLeftTried] = useState(false);
  const [leftErr, setLeftErr] = useState(false);

  const [rightSrc, setRightSrc] = useState<string | undefined>(rightUrl);
  const [rightTried, setRightTried] = useState(false);
  const [rightErr, setRightErr] = useState(false);

  useEffect(() => {
    setLeftSrc(leftUrl);
    setLeftTried(false);
    setLeftErr(false);
  }, [leftUrl]);
  useEffect(() => {
    setRightSrc(rightUrl);
    setRightTried(false);
    setRightErr(false);
  }, [rightUrl]);

  useEffect(() => {
    console.log("[SplitViewer] props:", { leftUrl, rightUrl });
  }, [leftUrl, rightUrl]);

  const onImgLoad =
    (label: "left" | "right") => (e: React.SyntheticEvent<HTMLImageElement>) =>
      console.log(`[SplitViewer] ${label} loaded:`, e.currentTarget.currentSrc);

  const onImgError =
    (label: "left" | "right") => (e: React.SyntheticEvent<HTMLImageElement>) =>
      console.warn(`[SplitViewer] ${label} error:`, e.currentTarget.src);

  const handleLeftError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      onImgError("left")(e);
      if (leftTried || !leftSrc) return setLeftErr(true);

      // blob은 다른 페이지로 넘어오면 만료 → 바로 에러로 처리
      if (isBlobUrl(leftSrc)) {
        setLeftErr(true);
        return;
      }

      if (isProxyUrl(leftSrc)) {
        const direct = fromProxy(leftSrc);
        if (direct) {
          setLeftSrc(direct);
          setLeftTried(true);
          setLeftErr(false);
          return;
        }
      } else if (isHttpUrl(leftSrc)) {
        setLeftSrc(toProxy(leftSrc));
        setLeftTried(true);
        setLeftErr(false);
        return;
      }
      setLeftErr(true);
    },
    [leftSrc, leftTried]
  );

  const handleRightError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      onImgError("right")(e);
      if (rightTried || !rightSrc) return setRightErr(true);
      if (isProxyUrl(rightSrc)) {
        const direct = fromProxy(rightSrc);
        if (direct) {
          setRightSrc(direct);
          setRightTried(true);
          setRightErr(false);
          return;
        }
      } else if (isHttpUrl(rightSrc)) {
        setRightSrc(toProxy(rightSrc));
        setRightTried(true);
        setRightErr(false);
        return;
      }
      setRightErr(true);
    },
    [rightSrc, rightTried]
  );

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
    if (e.buttons === 1) drag(e.clientX);
  }, []);
  const onTouchMove = useCallback((e: React.TouchEvent) => {
    drag(e.touches[0].clientX);
  }, []);

  const leftIsBlob = isBlobUrl(leftSrc);

  return (
    <div
      ref={ref}
      className="relative w-full rounded-lg bg-[#181a1b] border border-white/10 overflow-hidden select-none"
      style={{ aspectRatio: "16 / 9" }}
      onMouseMove={onMouseMove}
      onTouchMove={onTouchMove}
    >
      {/* left */}
      {leftSrc && !leftErr && !leftIsBlob ? (
        <img
          src={leftSrc}
          alt="uploaded"
          className="absolute inset-0 h-full w-full object-contain"
          onLoad={onImgLoad("left")}
          onError={handleLeftError}
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center text-sm text-white/60 px-4 text-center">
          {leftIsBlob
            ? "이전 단계 미리보기(blob)는 새 페이지로 이동하면 만료됩니다. 업로드 목록에서 이미지를 선택해 주세요."
            : "업로드 이미지 없음"}
        </div>
      )}

      {/* right with clip */}
      {rightSrc && !rightErr && (
        <img
          src={rightSrc}
          alt="generated"
          className="absolute inset-0 h-full w-full object-contain"
          style={{ clipPath: `inset(0 0 0 ${x}%)` }}
          onLoad={onImgLoad("right")}
          onError={handleRightError}
        />
      )}
      {rightErr && (
        <div className="absolute inset-0 grid place-items-center text-sm text-red-300/80">
          이미지를 불러오지 못했어요.
        </div>
      )}

      {/* handle */}
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
