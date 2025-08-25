"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import type { FeedItem } from "../../gallery/_lib/types";
import { getFeeds } from "../../gallery/_lib/api";

export default function PickGrid() {
    const router = useRouter();
    const moreHref = "/gallery";

    // 데이터 상태
    const [items, setItems] = useState<FeedItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    /** 최초 1회: 최신 8장만 로드 */
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setErr(null);
            try {
                const res = await getFeeds({
                    offset: 0,
                    limit: 8,
                    // ✅ 백엔드가 기본 최신순이라면 이대로 OK.
                    // 만약 created_at 필드가 있다면 다음과 같이 프론트에서 보강 정렬 가능:
                    // (아래 두 줄 주석 해제)
                    // feeds: undefined,
                    // sort: "latest",
                });

                // (선택) created_at이 있다면 안전하게 최신순 정렬
                // const sorted = [...res.feeds].sort(
                //   (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                // );

                setItems(res.feeds.slice(0, 8));
            } catch (e: unknown) {
                const message = e instanceof Error ? e.message : "불러오기 실패";
                setErr(message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    /** 카드 클릭 → 상세 페이지 이동 (필터/즐겨찾기 쿼리 없음) */
    const goDetail = (id: number) => {
        router.push(`/gallery/${id}`);
    };

    return (
        <section
            className="
        flex max-w-[1440px] px-6 flex-col items-center w-full
        pt-[28px]
        mx-auto
      "
        >


            <div className="w-[1300px] mb-8 flex items-center justify-between ">
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


            {err && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                    {err}
                </div>
            )}


            {/* 로딩 */}
            {loading && items.length === 0 && (
                <div className="w-full flex justify-center items-center py-20 text-gray-500">
                    불러오는 중...
                </div>
            )}

            {/* 빈 상태 */}
            {!loading && items.length === 0 && (
                <div className="w-full flex justify-center items-center py-20 text-gray-500">
                    등록된 피드가 없습니다.
                </div>
            )}

            {/* 데이터 표시 (2열 고정 / 최대 8장) */}
            {items.length > 0 && (
                <div className="grid grid-cols-2 gap-x-5 gap-y-5">
                    {items.slice(0, 8).map((item) => (
                        <article
                            key={`feed-${item.id}`}
                            onClick={() => goDetail(item.id)}
                            className="
                relative w-[322px] h-[374px]
                rounded-[40px] bg-[#D9D9D9]
                overflow-hidden cursor-pointer
                transition-transform duration-300 ease-in-out transform-gpu
                hover:scale-[1.03] hover:z-10
                border-0 ring-0 outline-none focus:outline-none focus-visible:outline-none
                justify-self-center
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
        </section>
    );
}
