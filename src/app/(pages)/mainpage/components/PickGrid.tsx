"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { FeedItem } from "../../gallery/_lib/types";
import { getFeeds } from "../../gallery/_lib/api";

export default function PickGrid() {
  const router = useRouter();
  const moreHref = "/gallery";

  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await getFeeds({ offset: 0, limit: 8 });
        setItems(res.feeds.slice(0, 8));
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : "불러오기 실패");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const goDetail = useCallback(
    (id: number) => {
      router.push(`/gallery/${id}`);
    },
    [router]
  );

  return (
    <section className="w-full">
      <div className="mx-auto w-full max-w-[1512px] px-6 pt-[28px]">
        {/* 헤더 */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-white text-[22px] font-semibold">픽플골라보기</h2>
          \
          <button
            type="button"
            onClick={() => router.push("/gallery")}
            aria-label="더보기"
            className="p-0 bg-transparent border-0 outline-none"
          >
            <img
              src="/svg/Button.png"
              alt="더보기"
              className="h-[50px] w-[115px] select-none pointer-events-none"
              loading="lazy"
            />
          </button>
        </div>

        {items.length > 0 && (
          <div className="flex flex-wrap gap-6 justify-start">
            {items.slice(0, 8).map((item) => (
              <article
                key={`feed-${item.id}`}
                onClick={() => goDetail(item.id)}
                className="
                w-[360px] h-[450px]
                rounded-[40px] bg-[#D9D9D9]
                overflow-hidden cursor-pointer
                transition-transform duration-300 ease-in-out
                hover:scale-[1.03] hover:z-10
              "
              >
                <img
                  src={item.image_url}
                  alt={item.business_type}
                  className="block w-full h-full object-cover"
                  loading="lazy"
                />
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
