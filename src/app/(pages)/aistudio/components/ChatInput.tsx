// src/app/(pages)/aistudio/components/ChatInput.tsx
"use client";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled?: boolean;
};

export default function ChatInput({
  value,
  onChange,
  onSend,
  disabled,
}: Props) {
  return (
    <div className="flex gap-2">
      <input
        className="h-11 flex-1 rounded-lg border px-3 text-sm"
        placeholder="프롬프트를 입력하세요 (예: 더 밝게, 선명하게)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
      />
      <button
        className="h-11 shrink-0 rounded-lg bg-gray-900 px-4 text-sm text-white disabled:opacity-40"
        onClick={onSend}
        disabled={disabled || !value.trim()}
      >
        전송
      </button>
    </div>
  );
}
