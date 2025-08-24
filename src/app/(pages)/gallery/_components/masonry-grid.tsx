import React from "react";

export default function MasonryGrid({ children }: { children: React.ReactNode }) {
    return (
        // Card Box 컨테이너
        <div className="w-[1320px] flex flex-col items-start gap-[24px]">
            {/* 상/하 패딩 32px을 '명시값'으로 적용 */}
            <div className="w-full py-[32px]">
                {/* 4열, 가로 10px / 세로 20px 간격을 '명시값'으로 적용 */}
                <div className="grid grid-cols-4 gap-x-[10px] gap-y-[20px] w-full">
                    {children}
                </div>
            </div>
        </div>
    );
}
