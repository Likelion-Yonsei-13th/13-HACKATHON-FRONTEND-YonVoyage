// app/gallery/_components/photo-card.tsx
"use client";

import type { FeedItem } from "../_lib/types";

export default function PhotoCard({
                                      item,
                                      onClick,
                                      onToggleLike,
                                  }: {
    item: FeedItem;
    onClick: () => void;
    onToggleLike: () => void;
}) {
    return (
        <article
            className="mb-4 break-inside-avoid overflow-hidden rounded-2xl border bg-white cursor-pointer"
            onClick={onClick}
        >
            <div className="relative">
                <img
                    src={item.image_url}
                    alt={item.business_type}
                    className="w-full h-auto object-cover"
                    loading="lazy"
                />
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleLike();
                    }}
                    className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-1 text-sm shadow hover:bg-white"
                    aria-label={item.picked ? "좋아요 취소" : "좋아요"}
                >
                    {item.picked ? "❤️" : "🤍"}
                </button>
            </div>
            <div className="p-3">
                <div className="text-[13px] text-gray-500">{item.business_type}</div>
                <div className="mt-1 text-xs text-gray-400">{new Date(item.created_at).toLocaleString()}</div>
            </div>
        </article>
    );
}
