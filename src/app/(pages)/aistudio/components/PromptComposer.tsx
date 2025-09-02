"use client";

import Image from "next/image";
import { useState } from "react";

const cx = (...xs: (string | false | undefined)[]) =>
  xs.filter(Boolean).join(" ");

export function PromptComposer({
  onSubmit,
  loading,
}: {
  onSubmit: (prompt: string) => void;
  loading?: boolean;
}) {
  const [prompt, setPrompt] = useState("");

  const submit = () => {
    if (!loading) onSubmit(prompt);
  };

  return (
    <div className="mt-6 relative">
      <textarea
        placeholder="사진을 지금보다 1.5배 더 밝게 해줘. 그리고 기념일에 맞는 축하 분위기로 플레이팅 이미지를 만들어줘!"
        className="w-full min-h-[120px] rounded-md bg-white text-black border border-white/10 p-4 pr-12 outline-none placeholder:text-black/30"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      {/* 텍스트영역 오른쪽 하단의 생성 버튼 (원형 배경 없음) */}
      <button
        type="button"
        onClick={submit}
        disabled={loading}
        title="이미지 생성"
        className={cx(
          "absolute bottom-3 right-3 h-8 w-8 grid place-items-center",
          loading ? "opacity-50 cursor-not-allowed" : "hover:opacity-80"
        )}
      >
        <Image
          src="/img/ai-studio/button.png"
          alt="생성 버튼"
          width={25}
          height={25}
          className="object-contain"
        />
      </button>
    </div>
  );
}
