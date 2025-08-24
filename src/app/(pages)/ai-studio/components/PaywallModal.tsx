// src/app/(pages)/aistudio/components/PaywallModal.tsx
"use client";

import { useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void; // 닫기 (백드롭/ESC/아니요/네 모두에서 사용 가능)
  onConfirm?: () => void; // 네 클릭 시 실행 (없으면 onClose fallback)
};

export default function PaywallModal({ open, onClose, onConfirm }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleConfirm = () => {
    // 네 클릭 => 페이지 이동 없이 모달만 닫기
    if (onConfirm) onConfirm();
    else onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[200] grid place-items-center bg-black/60"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* 모달 카드 */}
      <div
        className="w-[min(92vw,720px)] rounded-2xl overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단 헤더 */}
        <div className="bg-emerald-500 px-6 py-5 text-black">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-[15px] font-semibold opacity-90">
                시작하기
              </div>
              <h3 className="text-3xl font-extrabold leading-tight">
                유료서비스
              </h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-black/10 grid place-items-center">
              {/* 체크 아이콘 */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M20 6L9 17l-5-5"
                  stroke="black"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* 본문 */}
        <div className="bg-[#1A1A1B] px-8 py-8 text-white">
          <div className="flex items-start gap-3 text-[20px] leading-relaxed">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              className="mt-1 flex-none"
            >
              <path
                d="M20 6L9 17l-5-5"
                stroke="#8B8B8B"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div>
              <p className="mb-3">무료 체험 5회권이 모두 소진되었습니다.</p>
              <p>회원가입 후 유료서비스를 진행하시겠습니까?</p>
            </div>
          </div>

          {/* 버튼 영역 */}
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={onClose}
              className="h-12 min-w-[180px] rounded-2xl border border-white/25 bg-transparent px-6 text-[20px] hover:bg-white/5 transition"
            >
              아니요
            </button>
            <button
              onClick={handleConfirm}
              className="h-12 min-w-[180px] rounded-2xl bg-emerald-500 px-6 text-[20px] text-black hover:bg-emerald-400 transition"
            >
              네
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
