"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation"; // ✅ 라우터 추가
import { useSearchParams } from "next/navigation";

import { DEFAULT_LIMIT } from "../_lib/constants";
import type { FeedItem } from "../_lib/types";
import { getFeeds, togglePick } from "../_lib/api";

import MasonryGrid from "./masonry-grid";
import { CardSkeleton } from "./skeletons";
import FilterBar from "./filter-bar";

import UnderBar from "@/app/_common/components/under-bar";

export default function GalleryBody() {
    const router = useRouter(); // ✅

    /** -------------------------------
     *  로그인: 개발용 가짜 UUID (옵션 A)
     *  실제 로그인 연동 시 이 훅 교체
     * -------------------------------- */
    const userUUID = useUserUUID(); // "dev-uuid-123"
    const search = useSearchParams();

    // 목록/페이징 상태
    const [items, setItems] = useState<FeedItem[]>([]);
    const [offset, setOffset] = useState(0);
    const [limit] = useState(DEFAULT_LIMIT);
    const [total, setTotal] = useState(0);

    // 필터 상태 (배타 로직)
    const [businessType, setBusinessType] = useState<string | undefined>(undefined);
    const [pickedOnly, setPickedOnly] = useState(false);

    useEffect(() => {
        const bt = search.get("businessType");
        const po = search.get("pickedOnly");
        if (bt) setBusinessType(bt);
        if (po === "true") setPickedOnly(true);
    }, [search]);

    // 기타 상태
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const canLoadMore = useMemo(() => offset < total, [offset, total]);
    const loaderRef = useRef<HTMLDivElement | null>(null);

    /** 🔹스켈레톤/데이터 배열 타입 통일 */
    const skeletons: (FeedItem | null)[] = useMemo(
        () => Array.from({ length: limit }).map(() => null),
        [limit]
    );
    const dataset: (FeedItem | null)[] =
        loading && items.length === 0 ? skeletons : items;

    /** 데이터 로드 */
    const load = async ({ reset = false } = {}) => {
        setLoading(true);
        setErr(null);
        try {
            const res = await getFeeds({
                offset: reset ? 0 : offset,
                limit,
                business_type: businessType,
                picked_only: pickedOnly || undefined,
                userUUID: userUUID || undefined,
            });
            if (reset) {
                setItems(res.feeds);
                setOffset(res.offset + res.feeds.length);
                setTotal(res.total);
            } else {
                setItems((prev) => [...prev, ...res.feeds]);
                setOffset(res.offset + res.feeds.length);
                setTotal(res.total);
            }
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "불러오기 실패";
            setErr(message);
        } finally {
            setLoading(false);
        }
    };

    /** 필터 변경 시 리셋 로드 */
    useEffect(() => {
        load({ reset: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [businessType, pickedOnly]);

    /** 무한 스크롤 */
    useEffect(() => {
        if (!loaderRef.current) return;
        if (!canLoadMore || loading) return;

        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) {
                        io.disconnect();
                        load();
                    }
                });
            },
            { rootMargin: "200px" }
        );

        io.observe(loaderRef.current);
        return () => io.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canLoadMore, loading]);

    /** ------ 배타 로직 핸들러 ------ */
        // 업종 선택되면 나의픽 해제
    const handleSelectBusinessType = (v?: string) => {
            setBusinessType(v);
            if (v) setPickedOnly(false);
            // 즉시 새 목록 원하면: load({ reset: true });
        };

    // 나의픽 토글되면 업종 해제 (로그인 필요)
    const handleTogglePickedOnly = () => {
        if (!userUUID) {
            alert("로그인 후 이용해주세요.");
            return;
        }
        setPickedOnly((prev) => {
            const next = !prev;
            if (next) setBusinessType(undefined);
            return next;
        });
        // 즉시 새 목록 원하면: load({ reset: true });
    };

    // 최신순(초기화) → 둘 다 OFF
    const handleResetLatest = () => {
        setBusinessType(undefined);
        setPickedOnly(false);
        // load({ reset: true });
    };

    /** 카드 좋아요 (낙관적 업데이트) */
    const handleToggleLike = async (id: number) => {
        if (!userUUID) return alert("로그인 후 이용해주세요.");
        // optimistic
        setItems((prev) =>
            prev.map((it) => (it.id === id ? { ...it, picked: !it.picked } : it))
        );
        try {
            const res = await togglePick(id, userUUID);
            setItems((prev) =>
                prev.map((it) => (it.id === id ? { ...it, picked: res.picked } : it))
            );
        } catch {
            // rollback
            setItems((prev) =>
                prev.map((it) => (it.id === id ? { ...it, picked: !it.picked } : it))
            );
        }
    };

    // ⛔️ 모달 삭제로 불필요해진 핸들러 제거
    // const handleDeleted = () => {
    //   load({ reset: true });
    // };

    /** ✅ 카드 클릭 → 상세 페이지 이동 (+ 다음 2장 id 쿼리로 전달) */

    const goDetail = (id: number) => {
            // 🔹 필터 상태를 쿼리로 추가
            const query = new URLSearchParams();
            if (businessType) query.set("businessType", businessType);
            if (pickedOnly) query.set("pickedOnly", "true");

            router.push(`/gallery/${id}?${query.toString()}`);
        };


    return (
        <section
            className="
        flex max-w-[1440px] px-6 flex-col items-center w-full
        pt-[28px]
        mx-auto
      "
        >
            <FilterBar
                businessType={businessType}
                onSelectBusinessType={handleSelectBusinessType}
                pickedOnly={pickedOnly}
                onTogglePickedOnly={handleTogglePickedOnly}
                onResetLatest={handleResetLatest}
                disabledMyPick={!userUUID}
            />

            {err && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                    {err}
                </div>
            )}

            <MasonryGrid>
                {dataset.map((item, i) =>
                    item ? (
                        <div key={`feed-${item.id}`}>
                            <article
                                onClick={() => goDetail(item.id)}
                                className="
                  relative w-[322px] h-[374px] flex-shrink-0
                  rounded-[40px] bg-[#D9D9D9]
                  overflow-hidden cursor-pointer
                  transition-transform duration-300 ease-in-out transform-gpu
                  hover:scale-[1.03] hover:z-10
                  border-0 ring-0 outline-none focus:outline-none focus-visible:outline-none
                "
                            >
                                <img
                                    src={item.image_url}
                                    alt={item.business_type}
                                    className="block w-full h-full object-cover"
                                    loading="lazy"
                                />

                            </article>
                        </div>
                    ) : (
                        <CardSkeleton key={`skeleton-${i}`} />
                    )
                )}
            </MasonryGrid>

            {/* 무한 스크롤 트리거는 더 불러올 게 있을 때만 */}
            {canLoadMore && <div ref={loaderRef} className="h-10" />}

            {/* ✅ 진짜 끝났을 때만 UnderBar 표시 */}
            {!canLoadMore && !loading && (
                <div className="mt-20 w-full">
                    <UnderBar />
                </div>
            )}


        </section>
    );
}

/** 개발용 가짜 로그인 UUID (옵션 A) */
function useUserUUID() {
    return "dev-uuid-123";
}
