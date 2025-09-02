"use client";

import React from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
};

/**
 * 반응형 그리드 컨테이너
 * - 데스크톱: 4열
 * - 태블릿: 3열
 * - 작은 태블릿: 2열
 * - 모바일: 1열
 * - 가로/세로 간격은 명시값(10px/20px) 유지
 * - 중앙 정렬 (max-w 1320px)
 */
export default function MasonryGrid({ children, className }: Props) {
  return (
    <div className={`w-full max-w-[1320px] mx-auto ${className ?? ""}`}>
      <div className="w-full py-[32px]">
        <div
          className="
            grid w-full
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-4
            gap-x-[10px] gap-y-[20px]
          "
        >
          {children}
        </div>
      </div>
    </div>
  );
}
