// src/app/(pages)/onboarding/components/Step5.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import type { StepProps } from "./types";

export default function Step5({ value }: StepProps) {
  // 전달받은 url 정리
  const resultUrl =
    typeof value === "string" && value.trim().length > 0 ? value.trim() : "";

  // 브리지 저장(다음 단계에서 재사용)
  useEffect(() => {
    if (!resultUrl) return;
    const prev = JSON.parse(
      localStorage.getItem("aistudio_bridge_last") || "{}"
    );
    localStorage.setItem(
      "aistudio_bridge_last",
      JSON.stringify({ ...prev, url: resultUrl, ts: Date.now() })
    );
  }, [resultUrl]);

  // 프록시 URL 준비
  const proxiedSrc = useMemo(
    () =>
      resultUrl ? `/api/proxy-image?u=${encodeURIComponent(resultUrl)}` : "",
    [resultUrl]
  );

  // 이미지 로딩 상태
  const [src, setSrc] = useState<string>("");
  const [err, setErr] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [triedProxy, setTriedProxy] = useState(false);

  useEffect(() => {
    setErr(false);
    setLoaded(false);
    setTriedProxy(false);
    setSrc(resultUrl || "");
  }, [resultUrl]);

  const handleError = () => {
    if (!triedProxy && proxiedSrc) {
      setTriedProxy(true);
      setErr(false);
      setLoaded(false);
      setSrc(proxiedSrc);
    } else {
      setErr(true);
    }
  };

  return (
    <section className="min-h-[60vh] w-full flex flex-col items-center justify-center gap-6 px-4">
      {/* 타이틀 - 반응형 */}
      <h2 className="text-white text-[15px] sm:text-xl font-bold text-center">
        결과값 확인
      </h2>

      {/* 카드 컨테이너 (Step2/3/4와 동일 규격) */}
      <div
        className="
          mx-auto w-full max-w-[454px]
          rounded-xl bg-[#212225]
          p-5 sm:p-7
          text-gray-200 shadow-[0_8px_16px_rgba(0,0,0,0.25)]
        "
      >
        {/* 이미지 래퍼: 폭 100%, 높이는 이미지 비율에 따름 */}
        <div className="w-full rounded-lg overflow-hidden bg-black/20">
          {src && !err ? (
            <img
              src={src}
              alt="생성 결과"
              className="block w-full h-auto object-contain"
              onLoad={() => setLoaded(true)}
              onError={handleError}
            />
          ) : (
            <div className="flex items-center justify-center py-16 text-sm text-neutral-400">
              {err
                ? "이미지를 불러오지 못했어요."
                : "아직 표시할 이미지가 없어요."}
            </div>
          )}
        </div>

        {/* 상태 텍스트 (필요하면 노출) */}
        {/* {resultUrl && (
          <p className="mt-3 text-xs text-white/60 text-center">
            상태: {err ? "에러" : loaded ? "로드 완료" : "로드 중…"}{" "}
            {triedProxy && !err ? "(프록시 사용 중)" : ""}
          </p>
        )} */}
      </div>
    </section>
  );
}
