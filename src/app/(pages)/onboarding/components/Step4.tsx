// app/onboarding/components/Step4.tsx
"use client";

import { useEffect, useState } from "react";
import { generateOnboardingImage } from "@/app/_common/apis/onboarding";

export default function Step4({
  value, // 부모에서 넘겨준 값(여기서는 이전 단계의 uploadId가 넘어오게 설계)
  onChange, // 결과 URL을 부모에 저장
}: {
  value?: string; // uploadId
  onChange: (v: string) => void; // resultUrl 저장
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!value) return; // uploadId가 아직 없으면 대기
      setLoading(true);
      try {
        const { resultUrl } = await generateOnboardingImage(value);
        if (!mounted) return;
        setResult(resultUrl);
        onChange(resultUrl); // answers[3] = resultUrl
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [value, onChange]);

  return (
    <section className="min-h-[60vh] flex flex-col justify-center gap-6">
      <h2 className="text-xl font-semibold">변환된 이미지</h2>

      <div className="aspect-[4/3] w-full rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
        {loading ? (
          <span className="text-gray-500">생성 중...</span>
        ) : result ? (
          <img
            src={result}
            alt="result"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-gray-500">아직 변환된 이미지가 없습니다</span>
        )}
      </div>
    </section>
  );
}
