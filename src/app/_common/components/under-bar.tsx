// src/app/_common/components/under-bar.tsx
"use client";
import Link from "next/link";

type UnderBarProps = {
  /** 내부를 app-shell로 감쌀지 여부 (TopBar와 동일 폭/패딩 매칭) */
  contained?: boolean;
};

export default function UnderBar({ contained = true }: UnderBarProps) {
  // 내부 컨테이너 클래스 (app-shell 사용 여부를 토글)
  const Wrap = ({ children }: { children: React.ReactNode }) => (
    <div className={contained ? "app-shell py-10" : "py-10"}>{children}</div>
  );

  return (
    <footer className="w-full bg-[#0F0F10]" role="contentinfo">
      <Wrap>
        <div className="flex flex-col gap-9">
          {/* 1줄: 링크들 */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="no-underline text-[#F5F5F5] font-inter font-light text-[17px] leading-[28px] tracking-[-0.255px]"
            >
              픽플
            </Link>
            <Link
              href="/mypage"
              className="no-underline text-[#F5F5F5] font-inter font-light text-[17px] leading-[28px] tracking-[-0.255px]"
            >
              FAQ
            </Link>
          </div>

          {/* 2줄: 정보 */}
          <p className="m-0 text-[#6B707F] font-inter font-light text-[17px] leading-[18px] tracking-[-0.2px]">
            연세대학교 멋쟁이사자처럼 3팀 YonVoyage
            <br />
            <a
              href="mailto:yonvoyage2025@gmail.com"
              className="no-underline text-[#6B707F] hover:underline"
            >
              yonvoyage2025@gmail.com
            </a>
          </p>

          {/* 3줄: 아이콘/카피라이트 */}
          <div className="flex w-full items-center justify-between">
            <img
              src="/svg/Footer-icon.svg"
              alt="픽플 로고"
              className="block w-[62px] h-[30px]"
            />
            <img
              src="/svg/Footer-copyright.svg"
              alt="copyright"
              className="block w-[36px] h-[36px]"
            />
          </div>
        </div>
      </Wrap>
    </footer>
  );
}
