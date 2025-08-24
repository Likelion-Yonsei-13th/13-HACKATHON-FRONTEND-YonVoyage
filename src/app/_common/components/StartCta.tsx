"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";

type Props = {
  text?: string;
  buttonText?: string;
  href?: string;
  useUpload?: boolean;
  onUpload?: (file: File) => void;
};

export default function StartCta({
  text = "내 사진으로 픽플 시작해볼까요?",
  buttonText = "시작",
  href = "/ai-studio",
  useUpload = false,
  onUpload,
}: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (useUpload) fileRef.current?.click();
    else router.push(href);
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onUpload?.(file);
    router.push(href);
  };

  return (
    <div className="text-center">
      <p className="text-white/90 text-base md:text-lg">{text}</p>

      {/* 문장과 버튼 사이 간격 — 전용 클래스가 강제로 보장 */}
      <div className="cta-start-wrap flex justify-center">
        <button type="button" onClick={handleClick} className="cta-start-btn">
          {buttonText}
        </button>
        {useUpload && (
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleChange}
          />
        )}
      </div>
    </div>
  );
}
