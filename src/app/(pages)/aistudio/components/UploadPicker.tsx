// src/app/(pages)/aistudio/components/UploadPicker.tsx
"use client";

import { useRef, useState } from "react";
import { uploadImage, type UploadedImage } from "@/app/_common/apis/aistudio";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";
const toAbsolute = (u?: string) => {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  return API_BASE ? `${API_BASE}${u.startsWith("/") ? "" : "/"}${u}` : u;
};
const normalizeForImg = (u?: string) => {
  if (!u) return "";
  const abs = toAbsolute(u);
  if (/^https:\/\//i.test(abs)) return abs;
  return `/api/proxy-image?u=${encodeURIComponent(abs)}`;
};

export function UploadPicker({
  uuid,
  items,
  selected,
  onSelect,
  onUploadedAdd,
  disabled,
}: {
  uuid: string;
  items: UploadedImage[];
  selected: UploadedImage | null;
  onSelect: (it: UploadedImage) => void;
  onUploadedAdd: (it: UploadedImage) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);

  const onPick = () => inputRef.current?.click();

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.currentTarget.value = "";
    if (!file) return;
    setBusy(true);
    try {
      const r = await uploadImage(file, uuid);
      const item: UploadedImage = {
        id: String(r.id),
        url: r.url, // 서버가 절대 URL을 주도록 프록시/백엔드 정규화
        createdAt: new Date().toISOString(),
      };
      onUploadedAdd(item);
    } catch (err) {
      console.error("[UploadPicker] upload error:", err);
      alert("이미지 업로드에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        onClick={onPick}
        disabled={disabled || busy}
        className="h-9 px-3 rounded-md bg-neutral-700 text-white/90 hover:bg-neutral-600 disabled:opacity-60"
      >
        이미지 업로드
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={onChange}
      />

      {/* 간단한 썸네일 리스트 (왼쪽에 최신) */}
      <div className="flex gap-2 overflow-x-auto">
        {items.map((it) => (
          <button
            key={it.id}
            onClick={() => onSelect(it)}
            className={[
              "h-[56px] w-[56px] rounded border overflow-hidden shrink-0",
              selected?.id === it.id ? "border-emerald-500" : "border-white/10",
            ].join(" ")}
            title={it.id}
          >
            <img
              src={normalizeForImg(it.url)}
              alt={it.id}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
