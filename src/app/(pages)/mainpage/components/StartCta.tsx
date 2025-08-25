"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./StartCta.module.css";

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
  href = "/aistudio",
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
      {/* 모듈 클래스 적용 */}
      <p className={styles["cta-text"]}>{text}</p>

      {/* 모듈 클래스 + Tailwind 같이 사용 가능 */}
      <div className={`${styles["cta-start-wrap"]} flex justify-center`}>
        <button
          type="button"
          onClick={handleClick}
          className={styles["cta-start-btn"]}
        >
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
