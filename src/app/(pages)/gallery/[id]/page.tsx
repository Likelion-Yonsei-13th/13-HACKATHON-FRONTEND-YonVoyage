// src/app/(pages)/gallery/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import TopBar from "@/app/_common/components/top-bar";
import UnderBar from "@/app/_common/components/under-bar";

import FilterBar from "../_components/filter-bar";
import { getFeedDetail, togglePick } from "../_lib/api";
import type { FeedDetail } from "../_lib/types";

function useUserUUID() {
    // 로그인 연동되면 실제 값으로 교체
    return "dev-uuid-123";
}

export default function GalleryDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const search = useSearchParams();
    const userUUID = useUserUUID();

    const [detail, setDetail] = useState<FeedDetail | null>(null);

    // ✅ 현재 URL 쿼리에 저장된 필터 상태 표시
    const businessType = search.get("businessType") ?? undefined;
    const pickedOnly = search.get("pickedOnly") === "true";

    // 쿼리 업데이트 유틸 (필터 조작 시 URL만 갱신)
    const updateQuery = (patch: Record<string, string | undefined>) => {
        const q = new URLSearchParams(search.toString());
        Object.entries(patch).forEach(([k, v]) => {
            if (!v) q.delete(k);
            else q.set(k, v);
        });
        router.replace(`/gallery/${id}?${q.toString()}`);
    };

    // FilterBar 핸들러
    const handleSelectBusinessType = (bt?: string) => {
        updateQuery({
            businessType: bt,
            pickedOnly: bt ? undefined : pickedOnly ? "true" : undefined, // 배타 처리
        });
    };
    const handleTogglePickedOnly = () => {
        const next = !pickedOnly;
        updateQuery({
            pickedOnly: next ? "true" : undefined,
            businessType: next ? undefined : businessType, // 배타 처리
        });
    };
    const handleResetLatest = () => {
        updateQuery({ businessType: undefined, pickedOnly: undefined });
    };

    // 🔹 상세만 로드 (picked 반영 위해 userUUID 전달 권장)
    useEffect(() => {
        if (!id) return;
        let alive = true;
        (async () => {
            try {
                const d = await getFeedDetail(Number(id), { userUUID });
                if (!alive) return;
                setDetail(d);
            } catch (e) {
                console.error(e);
            }
        })();
        return () => {
            alive = false;
        };
    }, [id, userUUID]);

    // ❤️ 좋아요 토글
    const handleToggleLike = async () => {
        if (!detail) return;
        // optimistic
        setDetail(prev => (prev ? { ...prev, picked: !prev.picked } : prev));
        try {
            const res = await togglePick(detail.id, userUUID);
            setDetail(prev =>
                prev ? { ...prev, picked: res.picked, pick_count: res.pick_count } : prev
            );
        } catch {
            // rollback
            setDetail(prev => (prev ? { ...prev, picked: !prev.picked } : prev));
        }
    };

    if (!detail) return <div className="text-white">불러오는 중…</div>;

    return (
        <main className="flex flex-col min-h-screen bg-black">
            {/* 상단 TopBar */}
            <TopBar />

            {/* 본문 컨테이너: 메인 갤러리와 동일 레이아웃 */}
            <section className="flex w-[1320px] py-8 flex-col justify-between items-start mx-auto px-[28px]">
                {/* 카드 위에 FilterBar */}
                <FilterBar
                    businessType={businessType}
                    onSelectBusinessType={handleSelectBusinessType}
                    pickedOnly={pickedOnly}
                    onTogglePickedOnly={handleTogglePickedOnly}
                    onResetLatest={handleResetLatest}
                    disabledMyPick={false}
                />

                {/* 카드 영역 (왼쪽 큰 카드만) */}
                <div className="flex w-full py-[32px]">
                    <div
                        className="relative rounded-[40px] bg-[rgba(18,18,18,0.20)] flex-shrink-0 overflow-hidden"
                        style={{ width: 654, height: 374 }}
                    >
                        <Image
                            src={detail.image_url}
                            alt={`feed-${detail.id}`}
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>

                {/* 👍 좋아요 버튼: 카드 아래 12px, 왼쪽에서 614px */}
                <button
                    onClick={handleToggleLike}
                    className="relative mt-3"
                    style={{ marginLeft: "614px", background: "transparent", border: "none", padding: 0 , cursor: "pointer",}}
                    aria-label={detail.picked ? "좋아요 취소" : "좋아요"}
                    title={detail.picked ? "좋아요 취소" : "좋아요"}
                >
                    <Image
                        src={detail.picked ? "/svg/Gallery-like-2.svg" : "/svg/Gallery-like.svg"}
                        alt="like"
                        width={40}
                        height={40}
                        priority
                    />
                </button>


                {/* 카드 하단 텍스트 (24px 간격, 지정 타이포) */}
                <div className="mt-[0px] space-y-2 text-left">
                    <p className="text-[#F5F5F5] font-inter text-[17px] font-bold leading-[28px] tracking-[-0.255px]">
                        닉네임: {detail.nickname}
                    </p>
                    <p className="text-[#F5F5F5] font-inter text-[17px] font-bold leading-[28px] tracking-[-0.255px]">
                        업종: {detail.business_type}
                    </p>
                    <p className="text-[#F5F5F5] font-inter text-[17px] font-bold leading-[28px] tracking-[-0.255px]">
                        픽수: {detail.pick_count}
                    </p>
                    <p className="text-[#F5F5F5] font-inter text-[17px] font-bold leading-[28px] tracking-[-0.255px]">
                        프롬프트: {detail.prompt}
                    </p>
                    <p className="text-[#F5F5F5] font-inter text-[17px] font-bold leading-[28px] tracking-[-0.255px]">
                        {(detail.user_tag ?? []).map((t) => `#${t} `)}
                    </p>
                </div>

                {/* 이전목록 버튼 (93x50, 지정 타이포/보더) */}
                <Link
                    href={`/gallery?${(() => {
                        const q = new URLSearchParams();
                        if (businessType) q.set("businessType", businessType);
                        if (pickedOnly) q.set("pickedOnly", "true");
                        return q.toString();
                    })()}`}
                    className="mt-6 flex w-[93px] h-[50px] justify-center items-center
                     rounded-[200px] border border-[#DDD]
                     text-[#F5F5F5] font-inter text-[17px] font-bold
                     leading-[28px] tracking-[-0.255px] text-center
                     hover:bg-white/10 mb-[118px] no-underline"
                >
                    이전목록
                </Link>
            </section>

            {/* 하단 UnderBar */}
            <div className="mt-auto w-full">
                <UnderBar />
            </div>
        </main>
    );
}
