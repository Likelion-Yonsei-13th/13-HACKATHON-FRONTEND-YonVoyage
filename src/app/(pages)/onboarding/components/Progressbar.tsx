type Props = { current: number; total: number };

export default function ProgressBar({ current, total }: Props) {
  const pct = Math.round(((current + 1) / total) * 100);

  return (
    <div aria-label={`진행률 ${pct}%`} className="w-full">
      <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-full bg-gray-800 transition-[width] duration-300 ease-in-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-2 text-right text-xs text-gray-500">
        {current + 1} / {total}
      </div>
    </div>
  );
}
