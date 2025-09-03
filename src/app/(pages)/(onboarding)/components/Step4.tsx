// src/app/(pages)/onboarding/components/Step4.tsx
"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import type { StepProps } from "./types";
import {
  uploadOnboardingImage,
  generateOnboardingImage,
  getGeneratedImage,
} from "@/app/_common/apis/onboarding";
import { getOrCreateUUID } from "@/app/_common/utils/uuid";

export default function Step4({ value, onChange }: StepProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // 로컬 임시 uuid (온보딩 트래킹용; 서버에 등록된 uuid와는 별개)
  const localUuid = useMemo(() => getOrCreateUUID(), []);
  const emit = onChange ?? (() => {});

  // blob url 정리
  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const pickFile = () => inputRef.current?.click();

  async function avifToPng(file: File): Promise<File> {
    const bitmap = await createImageBitmap(
      await file.arrayBuffer().then((b) => new Blob([b]))
    );
    const canvas = document.createElement("canvas");
    const { width, height } = bitmap;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(bitmap, 0, 0);
    const blob: Blob = await new Promise((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("toBlob 실패"))),
        "image/png"
      )
    );
    return new File([blob], file.name.replace(/\.avif$/i, ".png"), {
      type: "image/png",
    });
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let f = e.target.files?.[0] ?? null;
    if (!f) return;

    try {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);

      const blobUrl = URL.createObjectURL(f);
      setFile(f);
      setPreviewUrl(blobUrl);

      // AVIF → PNG 변환
      if (f.type === "image/avif") {
        try {
          f = await avifToPng(f);
          console.log("[Step4] AVIF → PNG 변환 완료:", f.name, f.type);
        } catch (err) {
          console.warn("[Step4] AVIF 변환 실패, 원본 업로드 시도:", err);
        }
      }

      setLoading(true);

      // 로그인 여부 판별: 서버에 "등록된" uuid가 있는지 확인
      // aistudio_user 예: { uuid: "server-uuid", nickname: "...", ... }
      const storedUser =
        JSON.parse(localStorage.getItem("aistudio_user") || "null") || {};
      const serverUuid =
        typeof storedUser?.uuid === "string" &&
        storedUser.uuid.trim().length > 0
          ? storedUser.uuid.trim()
          : undefined;

      // 업로드 (명세상: 온보딩은 uuid 미전송, 로그인은 uuid 전송)
      console.log(
        "[Step4] upload start localUuid:",
        localUuid,
        "serverUuid?:",
        serverUuid,
        "file:",
        f.name,
        f.type,
        f.size
      );
      const up = await uploadOnboardingImage(f, serverUuid);
      const uploadId = String(up.uploadId ?? "");
      const serverUrl =
        typeof up.previewUrl === "string" && /^https?:\/\//i.test(up.previewUrl)
          ? up.previewUrl
          : undefined;
      console.log(
        "[Step4] upload done → uploadId:",
        uploadId,
        "previewUrl:",
        up.previewUrl
      );

      // 브리지 저장(업로드 결과)
      const prev = JSON.parse(
        localStorage.getItem("aistudio_bridge_last") || "{}"
      );
      const bridgeAfterUpload = {
        ...prev,
        // 로컬 추적용 uuid도 남겨두되, 서버 uuid는 별도로 보관
        uuid: localUuid,
        serverUuid, // ✅ 서버에 등록된 uuid만 별도로 저장
        uploadedId: uploadId,
        uploadedUrl: serverUrl || undefined,
        ts: Date.now(),
      };
      localStorage.setItem(
        "aistudio_bridge_last",
        JSON.stringify(bridgeAfterUpload)
      );

      // Step3에서 저장된 options(슬러그) 가져오기 (예: ["basic","composition"])
      const optionsFromBridge = Array.isArray(prev?.options)
        ? prev.options
        : ["basic", "composition"]; // 기본값
      console.log("[Step4] generate with options:", optionsFromBridge);

      // prompt 결정: 브리지에 있으면 우선 사용
      let prompt: string | undefined =
        typeof prev?.prompt === "string" && prev.prompt.trim().length > 0
          ? prev.prompt.trim()
          : undefined;

      // 서버 uuid가 있고(prompt 필수 정책), prompt가 없다면 옵션 기반 기본 프롬프트 생성
      if (serverUuid && !prompt) {
        const o = new Set(optionsFromBridge);
        const chunks: string[] = [];
        if (o.has("basic"))
          chunks.push("색감·밝기·콘트라스트를 자연스럽게 보정");
        if (o.has("composition"))
          chunks.push("음식이 잘 보이도록 구도/크기 조정");
        if (o.has("concept")) chunks.push("전체 콘셉트를 식욕 돋게 강화");
        prompt =
          chunks.length > 0
            ? `${chunks.join(", ")}. 인공적인 느낌 없이 맛있어 보이게 해줘.`
            : "자연스럽고 맛있어 보이게 보정해줘.";
      }

      // 이미지 생성 요청
      // - 온보딩: uuid(undefined) → 서버 정책상 prompt 불필수
      // - 로그인: uuid(serverUuid) → 서버 정책상 prompt 필수(위에서 생성/사용)
      const gen = await generateOnboardingImage(uploadId, {
        uuid: serverUuid, // ✅ 서버 등록 uuid만 전송
        options: optionsFromBridge,
        prompt, // 로그인인 경우 필수, 온보딩이면 있어도 무방
      });
      console.log("[Step4] generate response:", gen);

      // URL 확보: 응답에 URL이 없으면 조회 폴백
      let finalUrl = gen.generated_image_url;
      if (!finalUrl && gen.generated_image_id) {
        try {
          const g = await getGeneratedImage(gen.generated_image_id);
          finalUrl = g.url;
          console.log("[Step4] fetched generated url:", finalUrl);
        } catch (err) {
          console.warn("[Step4] getGeneratedImage 실패:", err);
        }
      }

      // 브리지 저장(생성 결과) + 부모에 전달(다음 스텝에서 바로 표시)
      const bridgeAfterGenerate = {
        ...bridgeAfterUpload,
        prompt, // 프롬프트도 같이 저장
        generatedId: gen.generated_image_id,
        url: finalUrl || bridgeAfterUpload.uploadedUrl || "",
        ts: Date.now(),
      };
      localStorage.setItem(
        "aistudio_bridge_last",
        JSON.stringify(bridgeAfterGenerate)
      );

      // Step5에서 이미지 표시용 value로 URL 넘김
      emit(bridgeAfterGenerate.url);
    } catch (err) {
      console.error("[Step4] 업로드/생성 에러:", err);
      alert("업로드 또는 생성에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[60vh] w-full flex flex-col items-center justify-center gap-6 px-4">
      <h2 className="text-white text-[15px] sm:text-xl font-bold text-center">
        내 음식사진 업로드
      </h2>

      <div className="mx-auto w-full max-w-[454px] rounded-xl bg-[#212225] p-5 sm:p-7 text-gray-200 shadow-[0_8px_16px_rgba(0,0,0,0.25)]">
        <div className="w-full flex flex-col items-center gap-5">
          <button
            type="button"
            onClick={pickFile}
            disabled={loading}
            className="relative block w-full max-w-[240px] aspect-square rounded-md bg-[#2B2C2F] hover:bg-[#303135] overflow-hidden transition ring-1 ring-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-60"
            title="이미지 선택"
            aria-label="이미지 업로드"
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="선택된 이미지 미리보기"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="absolute inset-0 grid place-items-center text-[12px] sm:text-sm text-gray-400">
                클릭해서 이미지를 업로드 해주세요.
              </span>
            )}
          </button>

          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif"
            className="hidden"
            onChange={handleFileChange}
            disabled={loading}
          />
        </div>
      </div>
    </section>
  );
}
