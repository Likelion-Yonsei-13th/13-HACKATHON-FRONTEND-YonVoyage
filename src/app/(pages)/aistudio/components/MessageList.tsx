// src/app/(pages)/aistudio/components/MessageList.tsx
"use client";

import type { ChatMessage } from "../hooks/useStudioChat";

export default function MessageList({ items }: { items: ChatMessage[] }) {
  return (
    <div className="space-y-4">
      {items.map((m) => {
        if (m.role === "user") {
          return (
            <div key={m.id} className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl bg-gray-900 px-4 py-2 text-sm text-white">
                {m.text}
              </div>
            </div>
          );
        }
        // system(업로드) & assistant(생성결과) 공통: 이미지 말풍선
        const label = m.role === "system" ? "업로드" : "결과";
        const url = m.role === "system" ? m.imageUrl : m.imageUrl;
        return (
          <div key={m.id} className="flex justify-start">
            <div className="max-w-[80%] space-y-1">
              <div className="text-xs text-gray-500">{label}</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={label}
                className="w-full rounded-xl border bg-white object-contain"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
