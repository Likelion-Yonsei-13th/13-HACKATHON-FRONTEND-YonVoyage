"use client";

import Link from "next/link";
import clsx from "clsx";

type TopBarProps = {
    /**
     * 페이지에 따라 강조할 메뉴.
     * "gallery" → '플레이팅골라보기'만 초록색
     * "aistudio" → 'AI스튜디오'만 초록색
     * undefined → 기본(둘 다 흰색)
     */
    highlight?: "gallery" | "aistudio";
};

export default function TopBar({ highlight }: TopBarProps) {
    return (
        <nav className="flex w-full h-[62px] px-6 py-3 justify-between items-center bg-black">
            {/* 왼쪽 버튼 그룹 */}
            <div className="flex items-center gap-[28px]">
                {/* '픽플' 로고는 기본이 초록색(기존 그대로) */}
                <Link
                    href="/"
                    className="no-underline text-[#00D560] font-inter font-bold text-[25px] leading-[28px] tracking-[-0.5px]"
                >
                    픽플
                </Link>

                {/* '플레이팅골라보기' — 기본 흰색, gallery에서만 초록색 */}
                <Link
                    href="/gallery"
                    className={clsx(
                        "no-underline font-inter text-[16px] leading-[18px] tracking-[-0.2px]",
                        highlight === "gallery" ? "text-[#00D560]" : "text-white"
                    )}
                >
                    플레이팅골라보기
                </Link>

                {/* 'AI스튜디오' — 기본 흰색, aistudio에서만 초록색 */}
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

            {/* 오른쪽 영역(마이페이지 등)은 기존 스타일 유지 */}
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
    );
}
