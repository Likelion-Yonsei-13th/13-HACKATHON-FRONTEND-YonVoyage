// src/app/(pages)/onboarding/components/Step5.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import type { StepProps } from "./types";

export default function Step5({ value }: StepProps) {
  const resultUrl =
    typeof value === "string" && value.trim().length > 0 ? value.trim() : "";

  // 프록시 URL
  const proxiedSrc = useMemo(
    () =>
      resultUrl ? `/api/proxy-image?u=${encodeURIComponent(resultUrl)}` : "",
    [resultUrl]
  );

  const [src, setSrc] = useState<string>("");
  const [err, setErr] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [triedProxy, setTriedProxy] = useState(false);

  // resultUrl 이 바뀌면 직링크부터 시도
  useEffect(() => {
    setErr(false);
    setLoaded(false);
    setTriedProxy(false);
    setSrc(resultUrl || "");
  }, [resultUrl]);

  const handleError = () => {
    if (!triedProxy && proxiedSrc) {
      // 직링크 실패 → 프록시로 폴백 1회 시도
      setTriedProxy(true);
      setErr(false);
      setLoaded(false);
      setSrc(proxiedSrc);
    } else {
      setErr(true);
    }
  };

  return (
    <section className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
      <h2 className="text-2xl font-bold text-white">결과값 확인</h2>

      <div
        className="rounded-lg overflow-hidden grid place-items-center"
        style={{
          width: 454,
          height: 356,
          minWidth: 280,
          borderRadius: 12,
          backgroundColor: "rgba(33, 34, 37, 1)",
          padding: 20,
          border: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        {src && !err ? (
          <img
            src={src}
            alt="생성 결과"
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              display: "block",
            }}
            onLoad={() => setLoaded(true)}
            onError={handleError}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-md bg-neutral-800/40 text-neutral-400 text-sm">
            {err
              ? "이미지를 불러오지 못했어요."
              : "아직 표시할 이미지가 없어요"}
          </div>
        )}
      </div>

      {resultUrl && (
        <div className="text-xs text-white/60">
          상태: {err ? "에러" : loaded ? "로드 완료" : "로드 중…"}{" "}
          {triedProxy && !err ? "(프록시 사용 중)" : ""}
        </div>
      )}

      {resultUrl && !err && (
        <div className="flex items-center gap-3">
          <a
            href={resultUrl}
            target="_blank"
            rel="noreferrer"
            className="h-10 px-4 rounded-md bg-neutral-700 text-white text-sm hover:bg-neutral-600"
          >
            새 탭에서 보기
          </a>
          <a
            href={resultUrl}
            download
            className="h-10 px-4 rounded-md bg-emerald-500 text-black text-sm hover:bg-emerald-400"
          >
            다운로드
          </a>
        </div>
      )}
    </section>
  );
}
