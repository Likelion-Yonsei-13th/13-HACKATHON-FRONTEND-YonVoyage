'use client';

import Link from "next/link";

export function TopBar() {
    return (
        <nav className="flex w-full h-[62px] px-6 py-3 justify-between items-center bg-black">
            {/* 왼쪽 버튼 그룹 */}
            <div className="flex items-center gap-[28px]">
                <Link
                    href="/"
                    className="no-underline text-[#00D560] font-inter font-bold text-[25px] leading-[28px] tracking-[-0.255px]"
                >
                    픽플
                </Link>

                <Link
                    href="/gallery"
                    className="no-underline text-[#F5F5F5] font-inter font-bold text-[17px] leading-[28px] tracking-[-0.255px]"
                >
                    플레이팅골라보기
                </Link>

                <Link
                    href="/aistudio"
                    className="no-underline text-[#F5F5F5] font-inter font-bold text-[17px] leading-[28px] tracking-[-0.255px]"
                >
                    AI스튜디오
                </Link>
            </div>

            {/* 오른쪽 버튼 */}
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
