// src/app/(pages)/aistudio/components/UploadDropzone.tsx
"use client";

type Props = {
  disabled?: boolean;
  onSelectFile: (file: File) => void;
};

export default function UploadDropzone({ disabled, onSelectFile }: Props) {
  return (
    <div className="rounded-xl border p-4">
      <div className="text-sm text-gray-600 mb-3">작업중인 내 이미지</div>
      <label className="inline-flex h-10 items-center rounded-lg border bg-white px-3 text-sm hover:bg-gray-50 cursor-pointer">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={disabled}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onSelectFile(f);
          }}
        />
        이미지 선택
      </label>
    </div>
  );
}
