'use client';

import Link from 'next/link';

export default function UnderBar() {
    return (
        <footer
            className="
        w-full max-w-[1920px] min-w-[768px]
        bg-[#0F0F10]
        px-6 py-10
      "
        >

            <div className="flex flex-col space-y-[36px]">
                {/* 1줄 */}
                <div className="flex items-center gap-[24px]">
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

                {/* 2줄 */}
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



                {/* 3줄 */}
                <div className="flex w-full items-center justify-between">
                    <img
                        src="/svg/Footer-icon.svg"
                        alt="footer-logo-icon"
                        className="block w-[62px] h-[30px]"
                    />

                    <a
                        href="https://www.instagram.com/likelion_yonsei/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-transparent p-0 border-0"
                    >
                        <img
                            src="/svg/Footer-instagram.svg"
                            alt="external-link"
                            className="block w-[36px] h-[36px]"
                        />
                    </a>
                </div>
            </div>
        </footer>
    );
}
