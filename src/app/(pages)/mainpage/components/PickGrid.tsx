"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image"; // ← 추가

type PickItem = { id: number; title?: string; img?: string };

const defaultItems: PickItem[] = Array.from({ length: 8 }).map((_, i) => ({
  id: i + 1,
}));

// 파일 경로만 프로젝트에 맞게 수정하세요.
const STAR_WHITE = "/svg/star-white.png"; // or .svg
const STAR_GREEN = "/svg/star-green.png"; // or .svg

export default function PickGrid({
  items = defaultItems,
  moreHref = "/picks",
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
      <div className="w-full flex justify-center px-6">
        <div className="w-full" style={{ maxWidth: 1080 }}>
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-white text-[22px] font-semibold">
              픽플골라보기
            </h2>

            <button
              type="button"
              onClick={() => router.push(moreHref)}
              className="inline-flex items-center justify-center h-8 px-4 rounded-full text-[13px] font-semibold transition"
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

          <div
            className="grid grid-cols-[repeat(4,minmax(0,1fr))]"
            style={{ columnGap: 16, rowGap: 16 }}
          >
            {items.map((item) => {
              const active = favs.has(item.id);
              return (
                <article
                  key={item.id}
                  className="relative overflow-hidden rounded-[18px] bg-[#EEEEEE] ring-1 ring-black/5"
                >
                  {/* 카드 비율 */}
                  <div className="aspect-[4/5] w-full" />

                  {/* 즐겨찾기 버튼 */}
                  <button
                    onClick={() => toggleFav(item.id)}
                    aria-label="즐겨찾기"
                    aria-pressed={active}
                    className="
                      absolute right-2.5 top-2.5
                      grid place-items-center
                      h-6 w-6 rounded-full
                    "
                    // 배경을 유지하고 싶으면 아래를 사용 (원 제거는 배경 투명으로)
                    style={{
                      backgroundColor: "rgba(0,0,0,0.08)", // 원 배경 유지
                      // backgroundColor: "transparent",   // 원 배경 제거하고 싶으면 이 줄로 변경
                      border: "1px solid rgba(0,0,0,0.10)",
                    }}
                  >
                    {/* ⬇️ 상태에 따라 별 이미지 교체 */}
                    <Image
                      src={active ? STAR_GREEN : STAR_WHITE}
                      alt="favorite"
                      width={12}
                      height={12}
                      className="pointer-events-none select-none"
                    />
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
