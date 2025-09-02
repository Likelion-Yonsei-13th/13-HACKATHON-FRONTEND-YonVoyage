// src/app/(pages)/onboarding/components/Step5.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import type { StepProps } from "./types";

export default function Step5({ value }: StepProps) {
  const resultUrl =
    typeof value === "string" && value.trim().length > 0 ? value.trim() : "";

  // 🔸 브리지에 결과 URL을 merge 저장(덮어쓰기 방지)
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

  const proxiedSrc = useMemo(
    () =>
      resultUrl ? `/api/proxy-image?u=${encodeURIComponent(resultUrl)}` : "",
    [resultUrl]
  );

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
    <section className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
      <h2 className="text-2xl font-bold text-white">결과값 확인</h2>

      <div
        className="rounded-lg overflow-hidden grid place-items-center"
        style={{ width: "100%", maxWidth: 500, height: "auto" }}
      >
        {src && !err ? (
          <img
            src={src}
            alt="생성 결과"
            style={{ width: "100%", height: "auto", objectFit: "cover" }}
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
    </section>
  );
}
