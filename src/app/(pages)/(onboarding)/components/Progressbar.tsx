type Props = { current: number; total: number };

export default function ProgressBar({ current, total }: Props) {
  const pct = Math.round(((current + 1) / total) * 100);

  return (
    <div aria-label={`진행률 ${pct}%`} className="w-full">
      {/* 진행 바 */}
      <div className="h-2 w-full rounded-full bg-neutral-700 overflow-hidden">
        <div
          className="h-full bg-emerald-500 transition-[width] duration-300 ease-in-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* 진행 텍스트 */}
      {/* <div className="mt-2 text-right text-xs text-neutral-400">
        {current + 1} / {total}
      </div> */}
    </div>
  );
}
