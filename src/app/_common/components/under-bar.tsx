// src/app/_common/components/under-bar.tsx
"use client";
import Link from "next/link";

export default function UnderBar() {
  return (
    <footer className="w-full bg-[#0F0F10]">
      {/* app-shell 쓰지 마세요! 부모가 이미 감싸고 있어요 */}
      <div className="py-10">
        <div className="flex flex-col gap-9">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-[#F5F5F5] no-underline">
              픽플
            </Link>
            <Link href="/mypage" className="text-[#F5F5F5] no-underline">
              FAQ
            </Link>
          </div>

          <p className="m-0 text-[#6B707F]">
            연세대학교 멋쟁이사자처럼 3팀 YonVoyage
            <br />
            <a
              href="mailto:yonvoyage2025@gmail.com"
              className="text-[#6B707F] hover:underline"
            >
              yonvoyage2025@gmail.com
            </a>
          </p>

          <div className="flex items-center justify-between">
            <img
              src="/svg/Footer-icon.svg"
              alt=""
              className="w-[62px] h-[30px]"
            />
            <img
              src="/svg/Footer-copyright.svg"
              alt=""
              className="w-[36px] h-[36px]"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
