"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { getFeedDetail } from "../_lib/api";
import type { FeedDetail, FeedItem } from "../_lib/types";
import PhotoCard from "../_components/photo-card";

import TopBar from "@/app/_common/components/top-bar";
import UnderBar from "@/app/_common/components/under-bar";

function useUserUUID() {
    return "dev-uuid-123"; // 로그인 연동 시 교체
}

export default function FeedDetailPage() {
    const params = useParams<{ id: string }>();
    const search = useSearchParams();
    const router = useRouter();
    const userUUID = useUserUUID();

    const id = Number(params.id);
    const nextIds = useMemo(
        () => (search.get("next") ?? "").split(",").map(Number).filter(Boolean),
        [search]
    );

    const [detail, setDetail] = useState<FeedDetail | null>(null);
    const [rightCards, setRightCards] = useState<FeedItem[]>([]);

    useEffect(() => {
        let alive = true;
        async function load() {
            const d = await getFeedDetail(id, { userUUID });
            if (!alive) return;
            setDetail(d);

            const rights: FeedItem[] = [];
            for (const nid of nextIds.slice(0, 2)) {
                try {
                    const nd = await getFeedDetail(nid, { userUUID });
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
        }
        load();
        return () => {
            alive = false;
        };
    }, [id, nextIds, userUUID]);

    if (!detail) return <div className="text-white">불러오는 중…</div>;

    return (
        <div className="flex flex-col min-h-screen bg-black">
            {/* 상단 TopBar */}
            <TopBar />

            {/* Body */}
            <section className="flex w-[1320px] h-[644px] py-8 flex-col justify-between items-start mx-auto">
                {/* 상단 카드 영역 */}
                <div className="flex w-full gap-[10px]">
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

                    {/* 오른쪽 2개 카드 */}
                    <div className="flex gap-[10px]">
                        {rightCards.map((it) => (
                            <div
                                key={it.id}
                                onClick={() => router.push(`/gallery/${it.id}`)}
                                className="
        relative cursor-pointer overflow-hidden
        rounded-[40px] bg-[rgba(178,178,178,0.50)] flex-shrink-0
      "
                                style={{ width: 322, height: 374 }}
                            >
                                <Image
                                    src={it.image_url}
                                    alt={`feed-${it.id}`}
                                    fill
                                    className="object-cover"
                                />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // 좋아요 토글 연결 필요하면 여기서 togglePick 호출
                                    }}
                                    className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-1 text-sm shadow hover:bg-white"
                                >
                                    {it.picked ? "❤️" : "🤍"}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 하단 정보 + 버튼 */}
                <div className="flex flex-col mt-6 text-left">
                    {/* 카드와 텍스트 사이 간격 24px */}
                    <div className="mt-6 space-y-2">
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
                            {detail.user_tag?.map((t) => `#${t} `)}
                        </p>
                    </div>

                    {/* 텍스트와 버튼 사이 간격 24px */}
                    <Link
                        href="/gallery"
                        className="mt-6 px-6 py-2 text-[#F5F5F5] font-inter text-[17px] font-bold leading-[28px] tracking-[-0.255px] text-center rounded-[200px] border border-[#DDD] hover:bg-white/10 inline-block w-fit"
                    >
                        이전목록
                    </Link>
                </div>
            </section>

            {/* 하단 UnderBar */}
            <UnderBar />
        </div>
    );
}
