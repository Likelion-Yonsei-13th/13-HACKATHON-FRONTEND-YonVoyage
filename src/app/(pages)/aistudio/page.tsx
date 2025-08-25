"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import Image from "next/image";
import {
  uploadImage,
  generateImage,
  listUploaded,
  listGenerated,
  saveGenerated,
  type UploadedImage,
  type GeneratedImage,
  HISTORY_CAP,
  hasReachedCap,
  appendGeneratedWithCap,
  placeholdersCount,
} from "@/app/_common/apis/aistudio";
import { SplitViewer } from "./components/SplitViewer";
import { PromptComposer } from "./components/PromptComposer";
import PaywallModal from "./components/PaywallModal";
import { UploadPicker } from "./components/UploadPicker"; // ✅ 추가

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
  const bridgeAppliedRef = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const [u, g] = await Promise.all([
          listUploaded(uuid),
          listGenerated(uuid),
        ]);
        setUploaded(u);
        if (u.length) setSelectedUploaded(u[0]);

        // 최신 5개만 유지, 오른쪽이 최신
        const last5 = g.slice(-HISTORY_CAP);
        setGenerated(last5);
        if (last5.length) setSelectedGenerated(last5[last5.length - 1]);
      } catch (e) {
        console.error("[INIT] load error:", e);
      }
    })();
  }, [uuid]);

  // 온보딩 → 브리지 1회 병합
  useEffect(() => {
    if (bridgeAppliedRef.current) return;
    try {
      const raw = localStorage.getItem("aistudio_bridge_last");
      if (!raw) return;
      const { generatedId, url } = JSON.parse(raw) as {
        generatedId: string;
        url: string;
      };
      setGenerated((prev) => {
        const exists = prev.some((g) => g.id === generatedId);
        const merged = exists
          ? prev
          : [
              ...prev,
              { id: generatedId, url, createdAt: new Date().toISOString() },
            ];
        return merged.slice(-HISTORY_CAP);
      });
      setSelectedGenerated({ id: generatedId, url });
      localStorage.removeItem("aistudio_bridge_last");
      bridgeAppliedRef.current = true;
    } catch {
      // ignore
    }
  }, [generated.length]);

  /** 생성 */
  const handleGenerate = useCallback(
    async (prompt: string) => {
      if (!prompt.trim()) return alert("프롬프트를 입력해주세요.");
      if (!uuid)
        return alert("로그인이 필요합니다. 닉네임/UUID 설정을 확인해주세요.");
      if (!selectedUploaded?.id)
        return alert("왼쪽에 참조 이미지를 먼저 업로드/선택해주세요.");

      if (hasReachedCap(generated)) {
        setPaywallOpen(true);
        return;
      }

      setLoading(true);
      try {
        const r = await generateImage({
          uuid,
          prompt,
          uploaded_image_id: String(selectedUploaded.id),
        });

        const item: GeneratedImage = {
          id: r.id,
          url: r.url,
          prompt,
          createdAt: new Date().toISOString(),
        };

        // 오른쪽 끝에 추가(최대 5개 유지)
        setGenerated((prev) => appendGeneratedWithCap(prev, item));
        setSelectedGenerated(item);
      } catch (e: any) {
        console.error("[GENERATE] error:", e);
        const msg = e?.message || "";
        if (/401|403/.test(msg)) {
          alert("로그인이 필요합니다. 닉네임/UUID를 먼저 등록해주세요.");
        } else {
          alert("이미지 생성에 실패했습니다.");
        }
      } finally {
        setLoading(false);
      }
    },
    [uuid, selectedUploaded, generated]
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

  /** 업로드 추가 핸들러 (UploadPicker에서 호출) */
  const handleUploadedAdd = useCallback((item: UploadedImage) => {
    setUploaded((prev) => [item, ...prev]); // 최신 업로드를 앞에 추가
    setSelectedUploaded(item);
  }, []);

  const placeholders = placeholdersCount(generated);

  return (
    <div className="min-h-dvh w-full text-white">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 mt-9">
        내 플레이팅 참고사진 보기
      </h2>
      <div className="h-px w-full bg-white/10 mb-6" />

      {/* ✅ 업로드 영역 */}
      <UploadPicker
        uuid={uuid}
        items={uploaded}
        selected={selectedUploaded}
        onUploadedAdd={handleUploadedAdd}
        onSelect={(it) => setSelectedUploaded(it)}
        disabled={loading}
      />

      {/* Before / After 뷰어 */}
      <div className="mt-6" />
      <SplitViewer
        leftUrl={selectedUploaded?.url}
        rightUrl={selectedGenerated?.url}
      />

      {/* 아이콘(보기/저장) */}
      <div className="flex items-center justify-end gap-4 text-white/70 text-sm mt-2">
        <button className="p-2" aria-label="보기">
          <Image
            src="/img/ai-studio/gallery.png"
            alt="갤러리"
            width={26}
            height={26}
            className="object-contain"
          />
        </button>
        <button
          className="p-2"
          aria-label="저장"
          onClick={handleSave}
          disabled={!selectedGenerated || loading}
        >
          <Image
            src="/img/ai-studio/download.png"
            alt="저장"
            width={18}
            height={18}
            className="object-contain"
          />
        </button>
      </div>

      {/* ===== 최근 작업(생성 결과) 스트립 ===== */}
      <div className="mt-8">
        <div className="w-full overflow-x-auto">
          <div className="w-fit mx-auto">
            <div className="flex gap-3 pb-1">
              {Array.from({ length: placeholders }).map((_, i) => (
                <div
                  key={`ph-${i}`}
                  className="relative h-[137px] w-[119px] shrink-0 rounded border border-white/10 overflow-hidden"
                  title="Free slot"
                >
                  <img
                    src="/img/ai-studio/free.png"
                    alt="Free slot"
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}

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

      {/* 프롬프트 + 생성 */}
      <PromptComposer onSubmit={handleGenerate} loading={loading} />

      {/* 하단 여백 */}
      <div className="h-10" />

      {/* 로딩 토스트 */}
      {loading && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-4 py-2 text-sm">
          처리 중...
        </div>
      )}

      {/* 유료 안내 모달 */}
      <PaywallModal open={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </div>
  );
}
