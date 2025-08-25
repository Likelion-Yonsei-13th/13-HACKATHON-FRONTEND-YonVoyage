"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type PickItem = { id: number; title?: string; img?: string };

const defaultItems: PickItem[] = Array.from({ length: 8 }).map((_, i) => ({
  id: i + 1,
}));

export default function MyPlating({
  items = defaultItems,
  moreHref = "/gallery",
}: {
  items?: PickItem[];
  moreHref?: string;
}) {
  const router = useRouter();
  const [favs, setFavs] = useState<Set<number>>(new Set([1]));
  const toggleFav = (id: number) =>
    setFavs((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <section className="mt-24 md:mt-28">
      {/* 중앙 폭 제한: 카드가 확실히 작아지도록 */}
      <div className="w-full flex justify-center px-6">
        <div className="w-full" style={{ maxWidth: 1080 }}>
          {/* 헤더: 좌측 타이틀, 우측 상단 버튼 */}
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-white text-[22px] font-semibold">
              내 플레이팅 참고하기
            </h2>

            {/* ▶ 검정 배경 + 흰 테두리 + 흰 글씨 pill 버튼 */}
            <button
              type="button"
              onClick={() => router.push(moreHref)}
              className="
                inline-flex items-center justify-center
                h-8 px-4 rounded-full
                text-[13px] font-semibold
                transition
              "
              style={{
                backgroundColor: "#0B0B0B",
                color: "#fff",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.7)",
              }}
            >
              더보기
            </button>
          </div>

          {/* 4열 고정 + 간격 강제 (전역 gap 0 무력화) */}
          <div
            className="grid grid-cols-[repeat(4,minmax(0,1fr))]"
            style={{ columnGap: 16, rowGap: 16 }}
          >
            {items.map((item) => {
              const active = favs.has(item.id);
              return (
                <article
                  key={item.id}
                  className="
                    relative overflow-hidden
                    rounded-[18px]
                    bg-[#EEEEEE] ring-1 ring-black/5
                  "
                >
                  {/* ▶ 정사각형보다 세로가 살짝 긴 직사각형: 4:5 비율 */}
                  <div className="aspect-[4/5] w-full" />
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
