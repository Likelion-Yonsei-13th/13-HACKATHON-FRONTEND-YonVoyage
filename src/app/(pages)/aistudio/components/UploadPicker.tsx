"use client";

import { useRef, useState, useCallback } from "react";
import { uploadImage, type UploadedImage } from "@/app/_common/apis/aistudio";

type Props = {
  uuid: string;
  items: UploadedImage[];
  selected?: UploadedImage | null;
  onUploadedAdd: (item: UploadedImage) => void; // 새 업로드 1건 추가
  onSelect: (item: UploadedImage) => void; // 선택 변경
  disabled?: boolean;
};

export function UploadPicker({
  uuid,
  items,
  selected,
  onUploadedAdd,
  onSelect,
  disabled,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);

  const openPicker = () => inputRef.current?.click();

  // (선택) AVIF → PNG 변환 헬퍼
  const avifToPng = useCallback(async (file: File): Promise<File> => {
    const bitmap = await createImageBitmap(
      await file.arrayBuffer().then((b) => new Blob([b]))
    );
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(bitmap, 0, 0);
    const blob: Blob = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b as Blob), "image/png")
    );
    return new File([blob], file.name.replace(/\.avif$/i, ".png"), {
      type: "image/png",
    });
  }, []);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f0 = e.target.files?.[0];
    if (!f0) return;

    let f = f0;
    // AVIF이면 PNG로 변환 시도 (실패하면 원본으로 업로드)
    if (f.type === "image/avif") {
      try {
        f = await avifToPng(f0);
        console.log("[UploadPicker] AVIF → PNG 변환 완료:", f.name);
      } catch (err) {
        console.warn("[UploadPicker] AVIF 변환 실패, 원본으로 업로드:", err);
      }
    }

    setBusy(true);
    try {
      const res = await uploadImage(f, uuid); // ✅ uuid 함께 전송
      const item: UploadedImage = {
        id: res.id,
        url: res.url,
        createdAt: new Date().toISOString(),
      };
      onUploadedAdd(item);
      onSelect(item);
    } catch (err) {
      console.error("[UploadPicker] 업로드 실패:", err);
      alert("업로드에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* 업로드 버튼 */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={openPicker}
          disabled={disabled || busy}
          className="h-10 px-4 rounded-md bg-neutral-700 text-white text-sm hover:bg-neutral-600 disabled:opacity-50"
          title="이미지 업로드"
        >
          {busy ? "업로드 중…" : "이미지 업로드"}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif"
        className="hidden"
        onChange={handleChange}
        disabled={disabled || busy}
      />

      {/* 업로드 썸네일 스트립 */}
      <div className="w-full overflow-x-auto">
        <div className="flex gap-3 pb-1">
          {items.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => onSelect(u)}
              className={[
                "relative h-20 w-24 shrink-0 rounded border overflow-hidden transition hover:scale-[1.02]",
                selected?.id === u.id
                  ? "border-emerald-500"
                  : "border-white/10",
              ].join(" ")}
              title={u.id}
            >
              <img
                src={u.url}
                alt={u.id}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
          {/* {!items.length && (
            // <div className="text-xs text-white/40 py-6 px-3">
            //   업로드된 이미지가 없습니다.
            // </div>
          )} */}
        </div>
      </div>
    </div>
  );
}
