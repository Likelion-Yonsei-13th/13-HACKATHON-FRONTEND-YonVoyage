"use client";

type StepNavProps = {
  showPrev: boolean;
  onPrev: () => void;
  onNext: () => void;
  prevDisabled?: boolean;
  nextDisabled?: boolean;
  nextLabel?: string;
  loadingLabel?: string;
  loading?: boolean;
};

export default function StepNav({
  showPrev,
  onPrev,
  onNext,
  prevDisabled = false,
  nextDisabled = false,
  nextLabel = "다음",
  loadingLabel = "처리 중…",
  loading = false,
}: StepNavProps) {
  return (
    <section className="mb-12 w-full">
      {/* 본문과 동일한 그리드 폭 맞춤 */}
      <div className="mx-auto w-full max-w-[960px] px-6 sm:px-0">
        {/* 모바일: 세로 1열 / sm+: 가로 2열 */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {showPrev && (
            <button
              type="button"
              onClick={onPrev}
              disabled={prevDisabled}
              className="h-12 w-full sm:flex-1 rounded-md bg-neutral-700 text-neutral-200 transition
                         hover:bg-neutral-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              이전
            </button>
          )}

          <button
            type="button"
            onClick={onNext}
            disabled={nextDisabled || loading}
            aria-busy={loading}
            className="h-12 w-full sm:flex-1 rounded-md bg-emerald-500 text-white transition
                       hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? loadingLabel : nextLabel}
          </button>
        </div>
      </div>
    </section>
  );
}
