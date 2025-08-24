"use client";

import React, { useEffect, useRef, useState } from "react";
import { CATEGORIES } from "../_lib/constants";
import { Fira_Sans } from "next/font/google";
import Image from "next/image";

const fira = Fira_Sans({
    subsets: ["latin"],
    weight: ["400", "500"], // 400: 드롭다운 아이템, 500: 버튼
});

type Props = {
    businessType?: string;
    onSelectBusinessType: (v?: string) => void; // 업종 선택 (배타 로직은 상위에서 처리)
    pickedOnly: boolean;
    onTogglePickedOnly: () => void;             // 나의픽 토글 (배타 로직은 상위에서 처리)
    onResetLatest: () => void;                  // 최신순(초기화)
    disabledMyPick: boolean;                    // 비로그인 시 true
};

export default function FilterBar({
                                      businessType,
                                      onSelectBusinessType,
                                      pickedOnly,
                                      onTogglePickedOnly,
                                      onResetLatest,
                                      disabledMyPick,
                                  }: Props) {
    return (
        <header className="flex w-[1392px] items-center justify-end">
            <div className="flex items-center gap-[10px]">
                {/* 최신순: 둘 다 OFF일 때 활성 */}
                <FilterButton
                    label="최신순"
                    /* active 조건은 프로젝트 로직에 맞춰 유지 */
                    active={!businessType && !pickedOnly}
                    onClick={onResetLatest}
                />

                {/* 업종순 (드롭다운) */}
                <BusinessTypeDropdown
                    value={businessType}
                    onChange={(v) => onSelectBusinessType(v)}
                />

                {/* 나의픽 */}
                <FilterButton
                    label="나의픽"
                    active={pickedOnly}
                    onClick={() => !disabledMyPick && onTogglePickedOnly()}
                    disabled={disabledMyPick}
                />
            </div>
        </header>
    );
}

/* ========================
   공용 버튼 (최신순/나의픽/업종순 트리거)
   - layout: w-117 h-47, p(8/16), gap 8px, center
   - default: border #F5F5F5
   - hover/selected: border #00D560, bg #00DF5A
   - typo: Fira Sans 16/20, #F5F5F5, 500
======================== */
function FilterButton({
                          label,
                          active,
                          onClick,
                          disabled,
                          withCaret,
                      }: {
    label: string;
    active?: boolean;
    onClick?: () => void;
    disabled?: boolean;
    withCaret?: boolean;
}) {
    const base =
        "flex w-[117px] h-[47px] px-4 py-2 justify-center items-center gap-[8px] flex-shrink-0 rounded-[200px] border transition";
    const notSelected =
        "border-[#F5F5F5] bg-transparent hover:border-[#00D560] hover:bg-[#00DF5A]";
    const selected = "border-[#00D560] bg-[#00DF5A]";
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className={[
                base,
                active ? selected : notSelected,
                disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
            ].join(" ")}
        >
      <span
          className={`${fira.className} text-[#F5F5F5] text-[16px] leading-5 font-medium`}
      >
        {label}
      </span>
            {withCaret && <CaretDown />}
        </button>
    );
}

/* 업종순 드롭다운: 버튼 폭과 컨테이너 폭을 동일하게 맞춤 */
function BusinessTypeDropdown({
                                  value,
                                  onChange,
                              }: {
    value?: string;
    onChange: (v?: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement | null>(null);
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const [width, setWidth] = useState<number>(117); // 기본 117px (버튼 스펙)

    useEffect(() => {
        // 바깥 클릭 닫기
        const onDoc = (e: MouseEvent) => {
            if (!rootRef.current) return;
            if (!rootRef.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", onDoc);
        return () => document.removeEventListener("mousedown", onDoc);
    }, []);

    useEffect(() => {
        // 버튼 실제 렌더 폭을 드롭다운 폭으로 사용
        if (triggerRef.current) {
            setWidth(triggerRef.current.offsetWidth);
        }
    }, [open]);

    return (
        <div className="relative" ref={rootRef}>
            <FilterButton
                label={value ?? "업종순"}
                withCaret
                active={open || !!value}
                onClick={() => setOpen((v) => !v)}
                // 버튼 실제 노드 참조를 위해 ref 주입
            />
            {/* ref를 FilterButton 내부에 직접 달 수 없으니 투명 오버레이로 측정 */}
            <button
                ref={triggerRef}
                aria-hidden
                tabIndex={-1}
                className="pointer-events-none absolute inset-0 opacity-0 w-[117px]"
            />

            {open && (
                // 바깥: 배경/보더/라운드/스크롤 담당
                <div
                    className="
            absolute left-0 z-50
            rounded-[8px] border overflow-auto
          "
                    style={{
                        width,
                        marginTop: '4px', // 버튼과 드롭다운 간격 4px
                        maxHeight: '476px',
                        borderColor: 'rgba(0, 0, 0, 0.10)',
                        backgroundColor: '#F5F5F5',
                        lineHeight: 'normal'
                    }}
                >
                    {/* 안쪽: 컨테이너 레이아웃 (상하 패딩 8px) */}
                    <div style={{ padding: '8px 0' }}>
                        {CATEGORIES.map((c, index) => (
                            <React.Fragment key={c}>
                                <DropdownItem
                                    key={c}
                                    label={c}
                                    active={value === c}
                                    onClick={() => {
                                        onChange(c);
                                        setOpen(false);
                                    }}
                                />
                                {/* 마지막 아이템이 아니면 간격 추가 - 4px */}
                                {index < CATEGORIES.length - 1 && (
                                    <div
                                        style={{
                                            height: '4px'
                                        }}
                                    />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/* 드롭다운 아이템
   - layout: padding 8px 16px; items-start; gap 10px; stretch
   - typo: Fira Sans, 16/20, weight 400, color #000
*/
function DropdownItem({
                          label,
                          active,
                          onClick,
                      }: {
    label: string;
    active?: boolean;
    onClick?: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={[
                "flex w-full items-start gap-[10px]",
                "appearance-none border-0 outline-none ring-0 bg-transparent",
                "hover:bg-white/70",
                "cursor-pointer select-none",
                `${fira.className} text-[16px] leading-5 font-normal text-black`,
            ].join(" ")}
            style={{
                margin: 0,
                lineHeight: '20px',
                padding: '8px 16px' // 인라인으로 패딩 강제 적용
            }}
        >
            {label}
        </button>
    );
}

/* 업종순 버튼 화살표 아이콘 (18x18), /public/svg/Gallery-filter.svg 사용 */
function CaretDown() {
    return (
        <span className="relative inline-flex w-[18px] h-[18px] shrink-0">
      <Image
          src="/svg/Gallery-filter.svg" // ✅ 지정 파일명
          alt=""
          fill
          className="object-contain pointer-events-none select-none"
          priority={false}
      />
    </span>
    );
}