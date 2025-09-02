// src/app/_common/components/top-bar.tsx
"use client";

import Link from "next/link";
import clsx from "clsx";

type TopBarProps = { highlight?: "gallery" | "aistudio" };

export default function TopBar({ highlight }: TopBarProps) {
  return (
    <nav className="w-full bg-black full-bleed">
      <div className="h-[62px] flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            href="/mainpage"
            className="no-underline text-[#00D560] font-inter font-bold text-[22px] sm:text-[25px]"
          >
            픽플
          </Link>

          <Link
            href="/gallery"
            className={clsx(
              "no-underline font-inter text-[14px] sm:text-[16px]",
              highlight === "gallery" ? "text-[#00D560]" : "text-white"
            )}
          >
            플레이팅골라보기
          </Link>

          <Link
            href="/aistudio"
            className={clsx(
              "no-underline font-inter text-[14px] sm:text-[16px]",
              highlight === "aistudio" ? "text-[#00D560]" : "text-white"
            )}
          >
            AI스튜디오
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/mypage" className="bg-transparent p-0 border-0">
            <img
              src="/svg/Topbar-Mypage.svg"
              alt="마이페이지"
              width={24}
              height={24}
            />
          </Link>
        </div>
      </div>
    </nav>
  );
}
