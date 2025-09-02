// src/app/_common/components/top-bar.tsx
"use client";

import Link from "next/link";
import clsx from "clsx";

type TopBarProps = {
  highlight?: "gallery" | "aistudio";
};

export default function TopBar({ highlight }: TopBarProps) {
  return (
    // ✅ 바깥은 화면 전체 배경
    <header className="w-full bg-black">
      {/* ✅ 내부 정렬/패딩은 app-shell에서 통일 */}
      <nav className="app-shell h-[62px] flex items-center justify-between">
        <div className="flex items-center gap-[28px]">
          <Link
            href="/mainpage"
            className="no-underline text-[#00D560] font-inter font-bold text-[25px] leading-[28px] tracking-[-0.5px]"
          >
            픽플
          </Link>

          <Link
            href="/gallery"
            className={clsx(
              "no-underline font-inter text-[16px] leading-[18px] tracking-[-0.2px]",
              highlight === "gallery" ? "text-[#00D560]" : "text-white"
            )}
          >
            플레이팅골라보기
          </Link>

          <Link
            href="/aistudio"
            className={clsx(
              "no-underline font-inter text-[16px] leading-[18px] tracking-[-0.2px]",
              highlight === "aistudio" ? "text-[#00D560]" : "text-white"
            )}
          >
            AI스튜디오
          </Link>
        </div>

        <div className="flex items-center gap-[28px]">
          <Link href="/mypage" className="bg-transparent p-0 border-0">
            <img
              src="/svg/Topbar-Mypage.svg"
              alt="마이페이지"
              width={24}
              height={24}
            />
          </Link>
        </div>
      </nav>
    </header>
  );
}
