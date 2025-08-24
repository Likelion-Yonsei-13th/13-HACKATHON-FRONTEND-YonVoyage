// app/gallery/_components/photo-modal.tsx
"use client";

import { useEffect, useState } from "react";
import { getFeedDetail, deleteFeed, togglePick } from "../_lib/api";
import type { FeedDetail } from "../_lib/types";

export default function PhotoModal({
                                       feedId,
                                       userUUID,
                                       onClose,
                                       onDeleted,
                                   }: {
    feedId: number;
    userUUID?: string;
    onClose: () => void;
    onDeleted: () => void; // 삭제 후 목록 갱신
}) {
    const [detail, setDetail] = useState<FeedDetail | null>(null);
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        let ignore = false;
        (async () => {
            setLoading(true);
            setErr(null);
            try {
                const d = await getFeedDetail(feedId, { userUUID });
                if (!ignore) setDetail(d);
            } catch (e: any) {
                if (!ignore) setErr(e?.message ?? "불러오기 실패");
            } finally {
                if (!ignore) setLoading(false);
            }
        })();
        return () => { ignore = true; };
    }, [feedId, userUUID]);

    const handleToggleLike = async () => {
        if (!userUUID || !detail) return;
        // 낙관적 업데이트
        setDetail({ ...detail, picked: !detail.picked, pick_count: detail.pick_count + (detail.picked ? -1 : 1) });
        try {
            const res = await togglePick(feedId, userUUID);
            setDetail((prev) => prev ? { ...prev, picked: res.picked, pick_count: res.pick_count } : prev);
        } catch {
            // 롤백
            setDetail((prev) => prev ? { ...prev, picked: !prev.picked, pick_count: prev.pick_count + (prev.picked ? -1 : 1) } : prev);
        }
    };

    const handleDelete = async () => {
        if (!userUUID || !detail?.is_mine) return;
        if (!confirm("정말 삭제하시겠어요?")) return;
        setBusy(true);
        try {
            await deleteFeed(feedId, userUUID);
            onDeleted();
            onClose();
        } catch (e: any) {
            alert(e?.message ?? "삭제 실패");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b px-5 py-3">
                    <div className="font-medium">상세 보기</div>
                    <button onClick={onClose} className="rounded-lg border px-3 py-1">목록으로</button>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-500">불러오는 중...</div>
                ) : err ? (
                    <div className="p-8 text-center text-red-600">{err}</div>
                ) : detail ? (
                    <div className="grid gap-6 p-5 lg:grid-cols-2">
                        <div className="space-y-3">
                            <img src={detail.image_url} alt="generated" className="w-full h-auto rounded-xl border" />
                            <div className="text-sm text-gray-500">생성 ID: {detail.generated_image_id}</div>
                            <button
                                onClick={handleToggleLike}
                                disabled={!userUUID}
                                className="rounded-xl border px-4 py-2 shadow-sm hover:shadow transition"
                                title={!userUUID ? "로그인 후 사용 가능" : ""}
                            >
                                {detail.picked ? "❤️ 좋아요 취소" : "🤍 좋아요"} · {detail.pick_count}
                            </button>
                            {detail.is_mine && (
                                <button
                                    onClick={handleDelete}
                                    disabled={busy}
                                    className="ml-2 rounded-xl border px-4 py-2 text-red-600 hover:bg-red-50"
                                >
                                    피드 삭제
                                </button>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="text-lg font-semibold">{detail.nickname}</div>
                            <div className="text-sm text-gray-600">업종: {detail.business_type}</div>
                            <div className="text-sm text-gray-600">작성자 UUID: {detail.uuid}</div>
                            <div className="text-sm text-gray-500">작성일: {new Date(detail.created_at).toLocaleString()}</div>
                            {detail.prompt && (
                                <div>
                                    <div className="mb-1 text-sm font-medium">프롬프트</div>
                                    <p className="whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-sm">{detail.prompt}</p>
                                </div>
                            )}
                            {detail.user_tag?.length ? (
                                <div className="flex flex-wrap gap-2">
                                    {detail.user_tag.map((t) => (
                                        <span key={t} className="rounded-full border px-2 py-[2px] text-xs text-gray-600">#{t}</span>
                                    ))}
                                </div>
                            ) : null}

                            <div>
                                <div className="mb-1 text-sm font-medium">원본 이미지</div>
                                <img src={detail.before_image_url} alt="before" className="w-full h-auto rounded-xl border" />
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
