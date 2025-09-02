// src/app/(pages)/aistudio/page.tsx
"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
// import Image from "next/image"; // ← 아이콘은 <img>로 교체하므로 제거
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
import { UploadPicker } from "./components/UploadPicker";

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

/** 상대경로 → 절대경로 보정 */
const toAbsolute = (u?: string) => {
  if (!u) return undefined;
  if (/^https?:\/\//i.test(u)) return u;
  const base = process.env.NEXT_PUBLIC_API_BASE || "";
  return base ? `${base}${u.startsWith("/") ? "" : "/"}${u}` : u;
};

/** 프록시 경유 URL 생성 */
const toProxy = (u?: string) =>
  u ? `/api/proxy-image?u=${encodeURIComponent(u)}` : undefined;

/** 이미지 src로 안전하게 사용할 URL 생성
 * - https 절대 URL: 그대로 사용(직통)
 * - 그 외(http/상대경로): 프록시 경유
 * - blob: 은 라우트 이동 시 무효 → 제외
 */
const normalizeForImg = (u?: string) => {
  if (!u) return undefined;
  if (u.startsWith("blob:")) return undefined;
  const abs = toAbsolute(u);
  if (!abs) return undefined;
  if (/^https:\/\//i.test(abs)) return abs; // ✅ S3 등은 직통
  return toProxy(abs); // http/상대경로는 프록시
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
      const parsed = JSON.parse(raw) as {
        generatedId?: string;
        url?: string;
        uploadedUrl?: string;
      };

      if (parsed.uploadedUrl && !selectedUploaded) {
        setSelectedUploaded({
          id: "bridge-upload",
          url: parsed.uploadedUrl,
          createdAt: new Date().toISOString(),
        });
      }

      if (parsed.generatedId && parsed.url) {
        const item: GeneratedImage = {
          id: parsed.generatedId,
          url: parsed.url,
          createdAt: new Date().toISOString(),
        };
        setGenerated((prev) => appendGeneratedWithCap(prev, item));
        setSelectedGenerated(item);
      }

      localStorage.removeItem("aistudio_bridge_last");
      bridgeAppliedRef.current = true;
    } catch {
      // ignore
    }
  }, [selectedUploaded]);

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
    setUploaded((prev) => [item, ...prev]);
    setSelectedUploaded(item);
  }, []);

  const placeholders = placeholdersCount(generated);

  // ✅ SplitViewer에 넘길 표시용 URL(정규화)
  const leftDisplayUrl = useMemo(
    () => normalizeForImg(selectedUploaded?.url),
    [selectedUploaded]
  );
  const rightDisplayUrl = useMemo(
    () => normalizeForImg(selectedGenerated?.url),
    [selectedGenerated]
  );

  return (
    <div className="min-h-dvh w-full text-white">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 mt-9">
        내 플레이팅 참고사진 보기
      </h2>
      <div className="h-px w-full bg-white/10 mb-6" />

      {/* 업로드 영역 */}
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
      <SplitViewer leftUrl={leftDisplayUrl} rightUrl={rightDisplayUrl} />

      {/* 아이콘(보기/저장) — 경고 방지를 위해 <img> 사용 */}
      <div className="flex items-center justify-end gap-4 text-white/70 text-sm mt-2">
        <button className="p-2" aria-label="보기">
          <img
            src="/img/ai-studio/gallery.png"
            alt="갤러리"
            width={26}
            height={26}
            style={{ display: "block" }}
          />
        </button>
        <button
          className="p-2"
          aria-label="저장"
          onClick={handleSave}
          disabled={!selectedGenerated || loading}
        >
          <img
            src="/img/ai-studio/download.png"
            alt="저장"
            width={18}
            height={18}
            style={{ display: "block" }}
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
                    src={normalizeForImg(img.url)}
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

      <div className="h-10" />

      {loading && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-4 py-2 text-sm">
          처리 중...
        </div>
      )}

      <PaywallModal open={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </div>
  );
}
