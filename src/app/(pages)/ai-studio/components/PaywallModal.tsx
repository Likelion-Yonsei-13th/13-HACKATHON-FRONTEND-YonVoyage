// src/app/(pages)/aistudio/components/PaywallModal.tsx
"use client";

export default function PaywallModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] grid place-items-center bg-black/60">
      <div className="w-[min(92vw,520px)] rounded-xl bg-[#111] text-white p-6 shadow-2xl">
        <h3 className="text-xl font-semibold mb-2">유료 플랜 안내</h3>
        <p className="text-sm text-white/70">
          무료로는 5개까지 생성할 수 있어요. 더 많은 이미지를 생성하려면 유료
          플랜을 이용해주세요.
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-md bg-neutral-700 px-4 py-2 text-sm hover:bg-neutral-600"
          >
            닫기
          </button>
          <a
            href="/pricing"
            className="rounded-md bg-emerald-500 px-4 py-2 text-sm text-black hover:bg-emerald-400"
          >
            요금제 보러가기
          </a>
        </div>
      </div>
    </div>
  );
}
