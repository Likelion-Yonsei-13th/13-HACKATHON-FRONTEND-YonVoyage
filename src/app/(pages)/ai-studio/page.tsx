"use client";

import { useEffect, useMemo, useState, useCallback } from "react";

// API들
import {
  uploadImage,
  generateImage,
  listUploaded,
  listGenerated,
  saveGenerated,
  type UploadedImage,
  type GeneratedImage,
} from "@/app/_common/apis/aistudio";

// 컴포넌트
import { SplitViewer } from "./components/SplitViewer";

import { PromptComposer } from "./components/PromptComposer";
import PaywallModal from "./components/PaywallModal";

/** helpers */
const cx = (...xs: (string | false | undefined)[]) =>
  xs.filter(Boolean).join(" ");

const getUUID = () => {
  if (typeof window === "undefined") return "";
  const KEY = "aistudio_uuid";
  let v = localStorage.getItem(KEY);
  if (!v) {
    v = crypto.randomUUID();
    localStorage.setItem(KEY, v);
  }
  return v;
};

const HISTORY_CAP = 5;

export default function AiStudioPage() {
  const uuid = useMemo(() => getUUID(), []);
  const [uploaded, setUploaded] = useState<UploadedImage[]>([]);
  const [generated, setGenerated] = useState<GeneratedImage[]>([]);
  const [selectedUploaded, setSelectedUploaded] =
    useState<UploadedImage | null>(null);
  const [selectedGenerated, setSelectedGenerated] =
    useState<GeneratedImage | null>(null);
  const [loading, setLoading] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);

  /** 초기 데이터 */
  useEffect(() => {
    (async () => {
      try {
        const [u, g] = await Promise.all([
          listUploaded(uuid),
          listGenerated(uuid),
        ]);
        setUploaded(u);
        const last5 = g.slice(-HISTORY_CAP);
        setGenerated(last5);
        if (u.length) setSelectedUploaded(u[0]);
        if (last5.length) setSelectedGenerated(last5[last5.length - 1]); // 가장 오른쪽(최근)
      } catch (e) {
        console.error(e);
      }
    })();
  }, [uuid]);

  /** 업로드 */
  const handleFiles = useCallback(
    async (files: File[]) => {
      setLoading(true);
      try {
        for (const f of files) await uploadImage(f);
        const next = await listUploaded(uuid);
        setUploaded(next);
        if (!selectedUploaded && next.length) setSelectedUploaded(next[0]);
      } catch (e) {
        console.error(e);
        alert("업로드에 실패했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [uuid, selectedUploaded]
  );

  /** 생성 */
  const handleGenerate = useCallback(
    async (prompt: string) => {
      if (!prompt.trim()) return alert("프롬프트를 입력해주세요.");

      // 5개 꽉 차면 유료 팝업 표시
      if (generated.length >= HISTORY_CAP) {
        setPaywallOpen(true);
        return;
      }

      setLoading(true);
      try {
        const r = await generateImage({
          uuid,
          prompt,
          image_id: selectedUploaded?.id,
        });

        const item: GeneratedImage = {
          id: r.id,
          url: r.url,
          prompt,
          createdAt: new Date().toISOString(),
        };

        // 오른쪽 끝에 추가
        setGenerated((prev) => [...prev, item]);
        setSelectedGenerated(item);
      } catch (e) {
        console.error(e);
        alert("이미지 생성에 실패했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [uuid, selectedUploaded, generated.length]
  );

  /** 저장 */
  const handleSave = useCallback(async () => {
    if (!selectedGenerated) return;
    setLoading(true);
    try {
      await saveGenerated(selectedGenerated.id);
      alert("저장되었습니다.");
    } catch (e) {
      console.error(e);
      alert("저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [selectedGenerated]);

  /** 히스토리 스트립용 플레이스홀더 */
  const placeholders = Math.max(0, HISTORY_CAP - generated.length);

  return (
    <div className="min-h-dvh w-full text-white">
      {/* 타이틀 */}
      <h2 className="text-lg sm:text-xl font-semibold mb-4 mt-9">
        내 플레이팅 참고사진 보기
      </h2>
      <div className="h-px w-full bg-white/10 mb-6" />

      {/* Before / After */}
      <SplitViewer
        leftUrl={selectedUploaded?.url}
        rightUrl={selectedGenerated?.url}
      />

      {/* 보기/저장 아이콘 */}
      <div className="flex items-center justify-end gap-4 text-white/70 text-sm mt-2">
        <button className="p-2" aria-label="보기">
          <svg
            width="24"
            height="24"
            viewBox="0 0 49 49"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.0415 38.7913V10.208H30.6248V38.7913H2.0415ZM34.7082 22.458V10.208H46.9582V22.458H34.7082ZM38.7915 18.3747H42.8748V14.2913H38.7915V18.3747ZM6.12484 34.708H26.5415V14.2913H6.12484V34.708ZM8.1665 30.6247H24.4998L19.1405 23.4788L15.3123 28.583L12.505 24.857L8.1665 30.6247ZM34.7082 38.7913V26.5413H46.9582V38.7913H34.7082ZM38.7915 34.708H42.8748V30.6247H38.7915V34.708Z"
              fill="white"
            />
          </svg>
        </button>

        <button
          className="p-2"
          aria-label="저장"
          onClick={handleSave}
          disabled={!selectedGenerated || loading}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 50 50"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19.75 24.5L28.5 33.5625M28.5 33.5625L37.25 24.5M28.5 33.5625V10M18 39H39"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* ===== 최근 작업(생성 결과) 스트립 ===== */}

      {/* ===== 최근 작업(생성 결과) 스트립 ===== */}
      <div className="mt-8">
        {/* 1) 바깥: 가로 스크롤 컨테이너 */}
        <div className="w-full overflow-x-auto">
          {/* 2) 가운데 정렬: 내용만큼만 차지(w-fit) + mx-auto */}
          <div className="w-fit mx-auto">
            {/* 3) 실제 아이템들 배치 */}
            <div className="flex gap-3 pb-1">
              {/* Free 플레이스홀더 */}
              {Array.from({ length: placeholders }).map((_, i) => (
                <div
                  key={`ph-${i}`}
                  className="relative h-20 w-24 shrink-0 rounded border border-white/10 overflow-hidden bg-neutral-800/50 grid place-items-end"
                  title="Free slot"
                >
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.06)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.06)_50%,rgba(255,255,255,0.06)_75%,transparent_75%,transparent)] bg-[length:12px_12px]" />
                  <span className="relative z-10 w-full text-center text-[11px] leading-[18px] bg-black/60 text-white">
                    Free
                  </span>
                </div>
              ))}

              {/* 실제 생성 썸네일 */}
              {generated.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedGenerated(img)}
                  className={cx(
                    "relative h-20 w-24 shrink-0 rounded border overflow-hidden transition hover:scale-[1.02]",
                    selectedGenerated?.id === img.id
                      ? "border-emerald-500"
                      : "border-white/10"
                  )}
                  title={img.prompt || img.id}
                >
                  <img
                    src={img.url}
                    alt={img.id}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 프롬프트 + 생성버튼*/}
      <PromptComposer onSubmit={handleGenerate} loading={loading} />

      {/* 하단 여백 */}
      <div className="h-10" />

      {/* 로딩 토스트 */}
      {loading && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-4 py-2 text-sm">
          처리 중...
        </div>
      )}

      {/* 유료 안내 모달 (별도 컴포넌트) */}
      <PaywallModal open={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </div>
  );
}
