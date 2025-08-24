"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Image from "next/image";

/** ---------- Types ---------- */
type UploadedImage = {
  id: string;
  url: string;
  createdAt?: string;
};

type GeneratedImage = {
  id: string;
  url: string;
  createdAt?: string;
  prompt?: string;
};

/** ---------- Small helpers ---------- */
const cls = (...xs: (string | false | undefined)[]) =>
  xs.filter(Boolean).join(" ");
const API_BASE = ""; // 같은 도메인이라면 비워두기(상대경로). 별도 도메인이면 "https://..." 넣기.

function getUUID(): string {
  // 로그인 전용에서 uuid 필요 시, localStorage에 보관
  if (typeof window === "undefined") return "";
  const key = "aistudio_uuid";
  let v = localStorage.getItem(key);
  if (!v) {
    v = crypto.randomUUID();
    localStorage.setItem(key, v);
  }
  return v;
}

/** ---------- API calls  ---------- */
async function apiUpload(file: File) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API_BASE}/api/studio/upload/`, {
    method: "POST",
    body: fd,
  });
  if (!res.ok) throw new Error("upload failed");
  return (await res.json()) as { id: string; url: string };
}

async function apiGenerate(payload: {
  uuid?: string;
  prompt: string;
  image_id?: string;
}) {
  const res = await fetch(`${API_BASE}/api/studio/generate/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("generate failed");
  return (await res.json()) as { id: string; url: string };
}

async function apiListUploaded(uuid?: string) {
  const q = uuid ? `?uuid=${encodeURIComponent(uuid)}` : "";
  const res = await fetch(`${API_BASE}/api/studio/uploaded/${q}`, {
    method: "GET",
    cache: "no-store",
  });
  if (!res.ok) throw new Error("list uploaded failed");
  return (await res.json()) as UploadedImage[];
}

async function apiGetGenerated(id: string) {
  const res = await fetch(`${API_BASE}/api/studio/${encodeURIComponent(id)}`, {
    method: "GET",
    cache: "no-store",
  });
  if (!res.ok) throw new Error("get generated failed");
  return (await res.json()) as GeneratedImage;
}

async function apiListGenerated(uuid?: string) {
  const q = uuid ? `?uuid=${encodeURIComponent(uuid)}` : "";
  const res = await fetch(`${API_BASE}/api/studio/generated/${q}`, {
    method: "GET",
    cache: "no-store",
  });
  if (!res.ok) throw new Error("list generated failed");
  return (await res.json()) as GeneratedImage[];
}

async function apiSaveGenerated(id: string) {
  const res = await fetch(
    `${API_BASE}/api/studio/${encodeURIComponent(id)}/save`,
    { method: "POST" }
  );
  if (!res.ok) throw new Error("save failed");
  return await res.json();
}

/** ---------- UI: Before/After Split Viewer ---------- */
function SplitViewer({
  leftUrl,
  rightUrl,
}: {
  leftUrl?: string; // 원본(업로드)
  rightUrl?: string; // 결과(생성)
}) {
  const [x, setX] = useState(50); // %
  const ref = useRef<HTMLDivElement | null>(null);

  const onDrag = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const nx = Math.min(
      100,
      Math.max(0, ((e.clientX - rect.left) / rect.width) * 100)
    );
    setX(nx);
  }, []);

  const onDragTouch = useCallback((e: React.TouchEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const t = e.touches[0];
    const nx = Math.min(
      100,
      Math.max(0, ((t.clientX - rect.left) / rect.width) * 100)
    );
    setX(nx);
  }, []);

  return (
    <div
      ref={ref}
      className="relative w-full rounded-lg bg-[#181a1b] border border-white/10 overflow-hidden select-none"
      style={{ aspectRatio: "16 / 9" }}
      onMouseMove={(e) => e.buttons === 1 && onDrag(e)}
      onTouchMove={onDragTouch}
    >
      {/* 좌측(업로드) */}
      {leftUrl ? (
        <img
          src={leftUrl}
          alt="uploaded"
          className="absolute inset-0 h-full w-full object-contain"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center text-sm text-white/40">
          업로드 이미지 없음
        </div>
      )}

      {/* 우측(생성) — 클리핑으로 왼쪽만큼 가림 */}
      {rightUrl && (
        <img
          src={rightUrl}
          alt="generated"
          className="absolute inset-0 h-full w-full object-contain"
          style={{ clipPath: `inset(0 0 0 ${x}%)` }}
        />
      )}

      {/* 중앙 드래그 라인/핸들 */}
      <div
        className="absolute inset-y-0"
        style={{ left: `${x}%`, transform: "translateX(-50%)" }}
      >
        <div className="h-full w-[2px] bg-white/80" />
        <div className="absolute top-1/2 -translate-y-1/2 -left-4 right-0 flex justify-center">
          <div className="rounded-full bg-white text-black text-xs px-2 py-1 shadow">
            ↔
          </div>
        </div>
      </div>
    </div>
  );
}

/** ---------- UI: Upload Dropzone ---------- */
function UploadDrop({
  onFiles,
  disabled,
}: {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}) {
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length) onFiles(files);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length) onFiles(files);
  };
  return (
    <label
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className={cls(
        "block rounded-md border border-dashed border-white/15",
        "bg-black/20 hover:bg-black/30 transition-colors cursor-pointer",
        "p-4 text-sm text-white/60"
      )}
    >
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={onChange}
        className="hidden"
      />
      <div className="flex items-center gap-3">
        <div className="rounded bg-emerald-600/20 text-emerald-300 px-2 py-1 text-xs">
          Free
        </div>
        <div>이미지를 드래그&드롭하거나 클릭해서 업로드</div>
      </div>
    </label>
  );
}

/** ---------- Page ---------- */
export default function AiStudioPage() {
  const uuid = useMemo(() => getUUID(), []);
  const [prompt, setPrompt] = useState("");
  const [uploaded, setUploaded] = useState<UploadedImage[]>([]);
  const [generated, setGenerated] = useState<GeneratedImage[]>([]);
  const [selectedUploaded, setSelectedUploaded] =
    useState<UploadedImage | null>(null);
  const [selectedGenerated, setSelectedGenerated] =
    useState<GeneratedImage | null>(null);
  const [loading, setLoading] = useState(false);

  /** 초기 데이터 로드 */
  useEffect(() => {
    (async () => {
      try {
        const [u, g] = await Promise.all([
          apiListUploaded(uuid),
          apiListGenerated(uuid),
        ]);
        setUploaded(u);
        setGenerated(g);
        if (u.length && !selectedUploaded) setSelectedUploaded(u[0]);
        if (g.length && !selectedGenerated) setSelectedGenerated(g[0]);
      } catch (e) {
        console.error(e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uuid]);

  /** 업로드 */
  const handleFiles = useCallback(
    async (files: File[]) => {
      setLoading(true);
      try {
        const results: UploadedImage[] = [];
        for (const f of files) {
          const r = await apiUpload(f);
          results.push({ id: r.id, url: r.url });
        }
        const list = await apiListUploaded(uuid);
        setUploaded(list);
        if (!selectedUploaded && list.length) setSelectedUploaded(list[0]);
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
  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return alert("프롬프트를 입력해주세요.");
    setLoading(true);
    try {
      const r = await apiGenerate({
        uuid,
        prompt,
        image_id: selectedUploaded?.id,
      });
      // 방금 생성건을 상단에
      const newItem: GeneratedImage = {
        id: r.id,
        url: r.url,
        prompt,
        createdAt: new Date().toISOString(),
      };
      setGenerated((prev) => [newItem, ...prev]);
      setSelectedGenerated(newItem);
    } catch (e) {
      console.error(e);
      alert("이미지 생성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [prompt, uuid, selectedUploaded]);

  /** 저장 */
  const handleSave = useCallback(async () => {
    if (!selectedGenerated) return;
    setLoading(true);
    try {
      await apiSaveGenerated(selectedGenerated.id);
      alert("저장되었습니다.");
    } catch (e) {
      console.error(e);
      alert("저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [selectedGenerated]);

  return (
    <div className="min-h-dvh w-full text-white">
      {/* 타이틀 */}
      <h2 className="text-lg sm:text-xl font-semibold mb-4 mt-9">
        내 플레이팅 참고사진 보기
      </h2>
      <div className="h-px w-full bg-white/10 mb-6" />

      {/* 비교 뷰어 */}
      <SplitViewer
        leftUrl={selectedUploaded?.url}
        rightUrl={selectedGenerated?.url}
      />

      {/* 업로드/다운로드 아이콘 영역 (우측) */}
      <div className="flex items-center justify-end gap-4 text-white/70 text-sm mt-2">
        {/* 조회/다운로드 자리만 잡아둠 */}
        <button className="p-2">
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

        <button className="p-2">
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

      {/* 업로드 썸네일 줄 */}
      <div className="mt-8">
        <div className="flex gap-3 overflow-x-auto pb-1">
          {uploaded.map((img) => (
            <button
              key={img.id}
              onClick={() => setSelectedUploaded(img)}
              className={cls(
                "relative h-20 w-24 shrink-0 rounded border",
                selectedUploaded?.id === img.id
                  ? "border-emerald-500"
                  : "border-white/10"
              )}
              title={img.id}
            >
              <img
                src={img.url}
                alt=""
                className="h-full w-full object-cover rounded"
              />
            </button>
          ))}
          {/* 업로드 드롭 */}
          <div className="w-48 shrink-0">
            <UploadDrop onFiles={handleFiles} disabled={loading} />
          </div>
        </div>
      </div>

      {/* 프롬프트 + 생성 버튼 */}
      <div className="mt-6 relative">
        <textarea
          placeholder="사진을 지금보다 1.5배 더 밝게 해줘. 그리고 기념일에 맞는 축하 분위기로 플레이팅 이미지를 만들어줘!"
          className="w-full min-h-[120px] rounded-md bg-[rgba(255,255,255,1)] text-black
             border border-white/10 p-4 pr-12 outline-none
             placeholder:text-black/30"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <button
          onClick={handleGenerate}
          disabled={loading}
          className={cls(
            "absolute bottom-3 right-3 h-8 w-8 grid place-items-center",
            loading ? "opacity-50 cursor-not-allowed" : "hover:opacity-80"
          )}
          title="이미지 생성"
        >
          <Image
            src="/img/ai-studio/button.png"
            alt="생성 버튼"
            width={20}
            height={20}
            className="object-contain"
          />
        </button>
      </div>

      {/* 하단 여백 */}
      <div className="h-10" />

      {/* 로딩 얇은 토스트 느낌 */}
      {loading && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-4 py-2 text-sm">
          처리 중...
        </div>
      )}
    </div>
  );
}
