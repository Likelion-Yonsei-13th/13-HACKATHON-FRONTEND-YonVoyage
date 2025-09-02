"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
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

const cx = (...xs: (string | false | undefined)[]) =>
  xs.filter(Boolean).join(" ");

const TILE_CLS = "h-[137px] w-[119px]";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";
const toAbsolute = (u?: string) =>
  !u
    ? ""
    : /^https?:\/\//i.test(u)
    ? u
    : `${API_BASE}${u.startsWith("/") ? "" : "/"}${u}`;
const normalizeForImg = (u?: string) => {
  if (!u) return "";
  const abs = toAbsolute(u);
  if (/^https:\/\//i.test(abs)) return abs;
  return `/api/proxy-image?u=${encodeURIComponent(abs)}`;
};

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

const LAST_LEFT_KEY = "aistudio_last_left"; // { type:'generated'|'uploaded', id, url }
const LAST_UPLOAD_KEY = "aistudio_last_uploaded"; // { id, url, ts }

// ---- 폴링 유틸 ----
function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/** 생성 결과의 url이 채워질 때까지 대기 */
async function waitForGeneratedUrl(
  uuid: string,
  id: string,
  {
    timeoutMs = 20000,
    intervalMs = 800,
  }: { timeoutMs?: number; intervalMs?: number } = {}
): Promise<string | null> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const list = await listGenerated(uuid);
      const found = list.find((x) => String(x.id) === String(id));
      if (found?.url) return found.url;
    } catch {
      // 일시 오류는 무시하고 재시도
    }
    await sleep(intervalMs);
  }
  return null;
}

function getLastUploadedId(): string | null {
  try {
    const raw = localStorage.getItem(LAST_UPLOAD_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    return obj?.id ? String(obj.id) : null;
  } catch {
    return null;
  }
}

export default function AiStudioPage() {
  const uuid = useMemo(() => getUUID(), []);
  const [generated, setGenerated] = useState<GeneratedImage[]>([]);
  const [selectedGenerated, setSelectedGenerated] =
    useState<GeneratedImage | null>(null);

  const [selectedUploaded, setSelectedUploaded] =
    useState<UploadedImage | null>(null);

  // 좌측에 표시할 URL
  const [leftUrl, setLeftUrl] = useState<string | undefined>(undefined);

  const [loading, setLoading] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [composerKey, setComposerKey] = useState(0);

  // 초기 로드(업로드/생성 목록 + 좌측 복원)
  useEffect(() => {
    (async () => {
      try {
        const [u, g] = await Promise.all([
          listUploaded(uuid),
          listGenerated(uuid),
        ]);

        const last5 = g.slice(-HISTORY_CAP);
        setGenerated(last5);
        if (last5.length) setSelectedGenerated(last5[last5.length - 1]);

        // 좌측 복원: localStorage > 최근 생성 > 최근 업로드
        let initialLeft: string | undefined;

        try {
          const raw = localStorage.getItem(LAST_LEFT_KEY);
          if (raw) {
            const saved = JSON.parse(raw) as {
              type: "generated" | "uploaded";
              id?: string;
              url?: string;
            };
            if (saved?.url) initialLeft = saved.url;
          }
        } catch {}

        if (!initialLeft && last5.length) {
          initialLeft = last5[last5.length - 1]?.url;
        }

        if (!initialLeft && u.length) {
          const lastUp = u[u.length - 1];
          initialLeft = lastUp?.url;
          setSelectedUploaded(lastUp);
        }

        if (initialLeft) setLeftUrl(initialLeft);
      } catch (e) {
        console.error("[INIT] load error:", e);
      }
    })();
  }, [uuid]);

  // 파일 업로드 공통 처리
  const doUpload = useCallback(
    async (file: File) => {
      setLoading(true);
      try {
        const { id, url } = await uploadImage(file, uuid);
        const uploadedItem: UploadedImage = {
          id,
          url,
          createdAt: new Date().toISOString(),
        };
        setSelectedUploaded(uploadedItem);
        setLeftUrl(url);
        setSelectedGenerated(null);

        localStorage.setItem(
          LAST_LEFT_KEY,
          JSON.stringify({ type: "uploaded", id, url })
        );
        localStorage.setItem(
          LAST_UPLOAD_KEY,
          JSON.stringify({ id, url, ts: Date.now() })
        );
      } catch (err) {
        console.error("[UPLOAD] error:", err);
        alert("이미지 업로드에 실패했습니다. 다시 시도해 주세요.");
      } finally {
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [uuid]
  );

  // 파일 선택/드롭
  const onClickCenterUpload = () => fileInputRef.current?.click();
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) doUpload(f);
  };
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) doUpload(f);
  };
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // 좌측 이미지가 있지만 uploaded_id가 없을 때: 프록시 재업로드로 id 확보
  const proxyUploadCurrentLeft =
    useCallback(async (): Promise<UploadedImage | null> => {
      if (!leftUrl) return null;
      try {
        const resp = await fetch(
          `/api/proxy-image?u=${encodeURIComponent(leftUrl)}`
        );
        if (!resp.ok) throw new Error("proxy fetch failed");
        const blob = await resp.blob();
        const ext = (blob.type?.split("/")[1] || "png").toLowerCase();
        const file = new File([blob], `base.${ext}`, {
          type: blob.type || "image/png",
        });
        const { id, url } = await uploadImage(file, uuid);
        const item: UploadedImage = {
          id,
          url,
          createdAt: new Date().toISOString(),
        };
        setSelectedUploaded(item);
        localStorage.setItem(
          LAST_UPLOAD_KEY,
          JSON.stringify({ id, url, ts: Date.now() })
        );
        return item;
      } catch (e) {
        console.error("[proxyUploadCurrentLeft] error:", e);
        return null;
      }
    }, [leftUrl, uuid]);

  // 생성에 쓸 uploaded_image_id 확보
  const ensureBaseUploadId = useCallback(async (): Promise<string | null> => {
    if (selectedUploaded?.id) return String(selectedUploaded.id);

    const fromLocal = getLastUploadedId();
    if (fromLocal) return fromLocal;

    try {
      const uploadedList = await listUploaded(uuid);
      if (uploadedList.length > 0) {
        const last = uploadedList[uploadedList.length - 1];
        setSelectedUploaded(last);
        localStorage.setItem(
          LAST_UPLOAD_KEY,
          JSON.stringify({ id: last.id, url: last.url, ts: Date.now() })
        );
        return String(last.id);
      }
    } catch {
      /* ignore */
    }

    // 마지막 보루: 현재 화면 이미지를 재업로드해서 id 생성
    const viaProxy = await proxyUploadCurrentLeft();
    if (viaProxy?.id) return String(viaProxy.id);
    return null;
  }, [selectedUploaded, uuid, proxyUploadCurrentLeft]);

  // ---- 생성 로직: url 폴링 후 반영 ----
  const handleGenerate = useCallback(
    async (prompt: string) => {
      console.log("[UI] submit prompt =>", prompt);
      if (!prompt.trim()) return alert("프롬프트를 입력해주세요.");
      if (!uuid)
        return alert("로그인이 필요합니다. 닉네임/UUID 설정을 확인해주세요.");
      if (hasReachedCap(generated)) {
        setPaywallOpen(true);
        return;
      }

      setLoading(true);
      try {
        const baseUploadedId = await ensureBaseUploadId();
        if (!baseUploadedId) {
          alert("먼저 가운데 박스에서 이미지를 업로드해 주세요.");
          return;
        }

        // 1) 생성 요청
        const r = await generateImage({
          uuid,
          prompt,
          uploaded_image_id: String(baseUploadedId),
        });

        // 2) url 즉시 수신 or 폴링로 확보
        let finalUrl: string | null = r.url ?? null;
        if (!finalUrl) {
          finalUrl = await waitForGeneratedUrl(uuid, r.id, {
            timeoutMs: 20000,
            intervalMs: 800,
          });
        }

        // 3) 상태 반영
        if (!finalUrl) {
          alert(
            "이미지 생성이 지연되고 있어요. 잠시 후 목록에서 확인해 주세요."
          );
          return;
        }

        const item: GeneratedImage = {
          id: r.id,
          url: finalUrl,
          prompt,
          createdAt: new Date().toISOString(),
        };
        setGenerated((prev) => appendGeneratedWithCap(prev, item));
        setSelectedGenerated(item);
        setLeftUrl(finalUrl);
        localStorage.setItem(
          LAST_LEFT_KEY,
          JSON.stringify({ type: "generated", id: r.id, url: finalUrl })
        );
      } catch (e: any) {
        console.error("[GENERATE] error:", e);
        const msg = e?.message || "";
        if (/401|403/.test(msg))
          alert("로그인이 필요합니다. 닉네임/UUID를 먼저 등록해주세요.");
        else alert("이미지 생성에 실패했습니다.");
      } finally {
        setLoading(false);
      }
      setComposerKey((k) => k + 1);
    },
    [uuid, generated, ensureBaseUploadId]
  );

  // 저장
  const handleSave = useCallback(async () => {
    if (!selectedGenerated) return;
    setLoading(true);
    try {
      await saveGenerated(selectedGenerated.id);
      alert("저장되었습니다.");
    } catch {
      alert("저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [selectedGenerated]);

  const placeholders = placeholdersCount(generated);
  const viewerVisible = !!leftUrl;

  return (
    <div className="min-h-dvh w-full text-white">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 mt-9">
        내 플레이팅 참고사진 보기
      </h2>
      <div className="h-px w-full bg-white/10 mb-6" />

      {/* 초기 업로드 박스 */}
      {!viewerVisible && (
        <div
          className="relative w/full rounded-lg bg-[#181a1b] border border-white/10 overflow-hidden"
          style={{ aspectRatio: "16 / 9" }}
          onClick={onClickCenterUpload}
          onDrop={onDrop}
          onDragOver={onDragOver}
          role="button"
          aria-label="이미지 업로드"
          title="클릭 또는 드래그&드롭으로 업로드"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="rounded-lg border-2 border-dashed border-white/20 bg-white/5 px-6 py-6">
                <div className="text-white/90 font-medium">이미지 업로드</div>
                <div className="text-xs text-white/60 mt-1">
                  클릭하거나 파일을 끌어다 놓으세요 (PNG, JPEG, WEBP, AVIF)
                </div>
              </div>
              {loading && (
                <div className="text-sm text-white/70">업로드 중…</div>
              )}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif"
            className="hidden"
            onChange={onFileChange}
            disabled={loading}
          />
        </div>
      )}

      {/* 뷰어 & 툴바 */}
      {viewerVisible && (
        <>
          <SplitViewer leftUrl={leftUrl} />

          <div className="flex items-center justify-between gap-4 text-white/70 text-sm mt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClickCenterUpload}
                disabled={loading}
                className="px-3 h-9 rounded-md border border-white/20 hover:bg-white/10 disabled:opacity-60"
                title="다른 이미지 업로드"
              >
                다른 이미지 업로드
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif"
                className="hidden"
                onChange={onFileChange}
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-end gap-4">
              <button className="p-2" aria-label="보기">
                <Image
                  src="/img/ai-studio/gallery.png"
                  alt="갤러리"
                  width={26}
                  height={26}
                  className="object-contain"
                  style={{ width: "auto", height: "auto" }}
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
                  style={{ width: "auto", height: "auto" }}
                />
              </button>
            </div>
          </div>
        </>
      )}

      {/* 최근 작업(생성 결과) 스트립 */}
      <div className="mt-8">
        <div className="w-full overflow-x-auto">
          <div className="w-fit mx-auto">
            <div className="flex gap-3 pb-1">
              {Array.from({ length: placeholders }).map((_, i) => (
                <div
                  key={`ph-${i}`}
                  className={cx(
                    "relative shrink-0 rounded border border-white/10 overflow-hidden",
                    TILE_CLS
                  )}
                  title="Free slot"
                >
                  <img
                    src="/img/ai-studio/free.png"
                    alt="Free slot"
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}

              {generated.map((img) => {
                const thumb = img?.url ? normalizeForImg(img.url) : null;
                return (
                  <button
                    key={img.id}
                    onClick={() => setSelectedGenerated(img)}
                    className={cx(
                      "relative shrink-0 rounded border overflow-hidden transition hover:scale-[1.02]",
                      TILE_CLS,
                      selectedGenerated?.id === img.id
                        ? "border-emerald-500"
                        : "border-white/10"
                    )}
                    title={img.prompt || img.id}
                  >
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={img.id}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full grid place-items-center text-xs text-white/40">
                        no image
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 프롬프트 UI */}
      {viewerVisible ? (
        <PromptComposer
          key={composerKey}
          onSubmit={handleGenerate}
          loading={loading}
        />
      ) : (
        <div className="mt-8 text-center text-white/60 text-sm">
          먼저 이미지를 업로드한 뒤 프롬프트를 입력해 주세요.
        </div>
      )}

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
