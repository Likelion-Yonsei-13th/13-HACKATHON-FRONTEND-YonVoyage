// src/app/(pages)/gallery/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import TopBar from "@/app/_common/components/top-bar";
import UnderBar from "@/app/_common/components/under-bar";

// ⬇️ 경로 주의: [id]/page.tsx 기준으로 한 단계 위가 gallery 폴더
import FilterBar from "../_components/filter-bar";
import { getFeedDetail } from "../_lib/api";
import type { FeedDetail, FeedItem } from "../_lib/types";

export default function GalleryDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const search = useSearchParams();

    const [detail, setDetail] = useState<FeedDetail | null>(null);
    const [rightCards, setRightCards] = useState<FeedItem[]>([]);

    // ✅ 현재 URL 쿼리에 저장된 필터 상태를 그대로 표시
    const businessType = search.get("businessType") ?? undefined;
    const pickedOnly = search.get("pickedOnly") === "true";

    // 쿼리 업데이트 유틸 (필터 조작 시 사용)
    const updateQuery = (patch: Record<string, string | undefined>) => {
        const q = new URLSearchParams(search.toString());
        Object.entries(patch).forEach(([k, v]) => {
            if (!v) q.delete(k);
            else q.set(k, v);
        });
        router.replace(`/gallery/${id}?${q.toString()}`);
    };

    // FilterBar 핸들러 (필터바 동작은 쿼리만 갱신)
    const handleSelectBusinessType = (bt?: string) => {
        // 업종 선택 시 my pick 배타 처리(켜져있으면 해제)
        updateQuery({
            businessType: bt,
            pickedOnly: bt ? undefined : pickedOnly ? "true" : undefined,
        });
    };
    const handleTogglePickedOnly = () => {
        const next = !pickedOnly;
        updateQuery({
            pickedOnly: next ? "true" : undefined,
            businessType: next ? undefined : businessType,
        });
    };
    const handleResetLatest = () => {
        updateQuery({ businessType: undefined, pickedOnly: undefined });
    };

    // 상세 + 오른쪽 2장 로드
    useEffect(() => {
        if (!id) return;
        let alive = true;
        (async () => {
            try {
                const d = await getFeedDetail(Number(id));
                if (!alive) return;
                setDetail(d);

                const nextParam = search.get("next") ?? "";
                const nextIds = nextParam
                    .split(",")
                    .map((v) => Number(v))
                    .filter(Boolean)
                    .slice(0, 2);

                const rights: FeedItem[] = [];
                for (const nid of nextIds) {
                    try {
                        const nd = await getFeedDetail(nid);
                        rights.push({
                            id: nd.id,
                            uuid: nd.uuid,
                            business_type: nd.business_type,
                            generated_image_id: nd.generated_image_id,
                            image_url: nd.image_url,
                            picked: nd.picked,
                            created_at: nd.created_at,
                            pick_count: nd.pick_count,
                        });
                    } catch {}
                }
                if (alive) setRightCards(rights);
            } catch (e) {
                console.error(e);
            }
        })();
        return () => {
            alive = false;
        };
    }, [id, search]);

    if (!detail) return <div className="text-white">불러오는 중…</div>;

    return (
        <main className="flex flex-col min-h-screen bg-black">
            {/* 상단 TopBar */}
            <TopBar />

            {/* 본문 컨테이너: 메인 갤러리와 동일 레이아웃 */}
            <section className="flex w-[1320px] py-8 flex-col justify-between items-start mx-auto px-[28px]">


                <FilterBar
                    businessType={businessType}
                    onSelectBusinessType={handleSelectBusinessType}
                    pickedOnly={pickedOnly}
                    onTogglePickedOnly={handleTogglePickedOnly}
                    onResetLatest={handleResetLatest}
                    disabledMyPick={false}
                />

                {/* 카드 영역 (왼쪽 큰 카드 + 오른쪽 2개) */}
                <div className="flex w-full gap-[10px] py-[32px]">
                    {/* 왼쪽 큰 카드 */}
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

                    {/* 오른쪽 2개 카드 (322x374, bg rgba(178,178,178,0.5), 사이 간격 10px, 텍스트 없음) */}
                    <div className="flex gap-[10px]">
                        {rightCards.map((it) => (
                            <div
                                key={it.id}
                                onClick={() => {
                                    const q = new URLSearchParams();
                                    if (businessType) q.set("businessType", businessType);
                                    if (pickedOnly) q.set("pickedOnly", "true");
                                    router.push(`/gallery/${it.id}?${q.toString()}`);
                                }}
                                className="relative cursor-pointer overflow-hidden rounded-[40px] bg-[rgba(178,178,178,0.50)] flex-shrink-0"
                                style={{ width: 322, height: 374 }}
                            >
                                <Image
                                    src={it.image_url}
                                    alt={`feed-${it.id}`}
                                    fill
                                    className="object-cover"
                                />

                            </div>
                        ))}
                    </div>
                </div>

                {/* 카드 하단 텍스트 (24px 간격, 지정된 타이포) */}
                <div className="mt-6 space-y-2 text-left ">
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

                {/* 이전목록 버튼 (요청한 93x50 고정 레이아웃/타이포) */}
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
