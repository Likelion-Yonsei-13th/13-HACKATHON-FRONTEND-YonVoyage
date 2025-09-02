"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { DEFAULT_LIMIT } from "../_lib/constants";
import type { FeedItem } from "../_lib/types";
import { getFeeds, togglePick } from "../_lib/api";

import MasonryGrid from "./masonry-grid";
import FilterBar from "./filter-bar";
import UnderBar from "@/app/_common/components/under-bar";

export default function GalleryBody() {
  const router = useRouter();
  const userUUID = useUserUUID();
  const search = useSearchParams();

  // 목록/페이징 상태
  const [items, setItems] = useState<FeedItem[]>([]);
  const [offset, setOffset] = useState(0);
  const [limit] = useState(DEFAULT_LIMIT);
  const [total, setTotal] = useState(0);

  // 필터 상태
  const [businessType, setBusinessType] = useState<string | undefined>();
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

  // ------ 필터 핸들러 ------
  const handleSelectBusinessType = (v?: string) => {
    setBusinessType(v);
    if (v) setPickedOnly(false);
  };

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
  };

  const handleResetLatest = () => {
    setBusinessType(undefined);
    setPickedOnly(false);
  };

  /** 좋아요 토글 (낙관적 업데이트) */
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

  /** 카드 클릭 → 상세 이동 (필터 상태 쿼리 유지) */
  const goDetail = (id: number) => {
    const query = new URLSearchParams();
    if (businessType) query.set("businessType", businessType);
    if (pickedOnly) query.set("pickedOnly", "true");
    router.push(`/gallery/${id}?${query.toString()}`);
  };

  return (
    <section className="w-full max-w-[1440px] mx-auto px-6 pt-[28px]">
      {/* 필터바도 같은 폭(1320px)으로 중앙 정렬 */}
      <div className="w-full max-w-[1320px] mx-auto">
        <FilterBar
          businessType={businessType}
          onSelectBusinessType={handleSelectBusinessType}
          pickedOnly={pickedOnly}
          onTogglePickedOnly={handleTogglePickedOnly}
          onResetLatest={handleResetLatest}
          disabledMyPick={false}
        />
      </div>

      {/* 에러 / 로딩 / 빈 상태도 같은 폭으로 */}
      {err && (
        <div className="w-full max-w-[1320px] mx-auto mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {err}
        </div>
      )}

      {loading && items.length === 0 && (
        <div className="w-full max-w-[1320px] mx-auto py-20 text-center text-gray-500">
          불러오는 중...
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="w-full max-w-[1320px] mx-auto py-20 text-center text-gray-500">
          등록된 피드가 없습니다.
        </div>
      )}

      {/* 카드 리스트 */}
      {items.length > 0 && (
        <MasonryGrid>
          {items.map((item) => (
            <div key={`feed-${item.id}`}>
              <article
                onClick={() => goDetail(item.id)}
                className="
                  relative w-full rounded-[40px] bg-[#D9D9D9]
                  overflow-hidden cursor-pointer
                  transition-transform duration-300 ease-in-out transform-gpu
                  hover:scale-[1.03] hover:z-10 outline-none
                "
              >
                {/* 비율 고정(예: 322×374)로 반응형 */}
                <div className="w-full aspect-[322/374]">
                  <img
                    src={item.image_url}
                    alt={item.business_type}
                    className="block w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </article>
            </div>
          ))}
        </MasonryGrid>
      )}

      {canLoadMore && (
        <div ref={loaderRef} className="h-10 w-full max-w-[1320px] mx-auto" />
      )}

      {!canLoadMore && !loading && (
        <div className="mt-20 w-full">
          <UnderBar />
        </div>
      )}
    </section>
  );
}

/** 로컬스토리지 UUID (로그인 전 임시) */
function useUserUUID() {
  const [uuid, setUuid] = useState<string | null>(null);
  useEffect(() => {
    try {
      const v =
        typeof window !== "undefined"
          ? window.localStorage.getItem("userUUID")
          : null;
      setUuid(v && v.trim() ? v : null);
    } catch {
      setUuid(null);
    }
  }, []);
  return uuid;
}
