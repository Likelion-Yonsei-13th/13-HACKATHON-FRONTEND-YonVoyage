// src/app/(pages)/aistudio/hooks/useStudioChat.ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  uploadWithPrompt,
  generateFromUpload,
  saveGeneratedImage,
} from "@/app/_common/apis/aistudio";

export type ChatRole = "user" | "assistant" | "system";
export type ChatMessage =
  | { id: string; role: "user"; text: string; createdAt: number }
  | {
      id: string;
      role: "assistant";
      imageUrl: string;
      generatedId: string; // 서버가 돌려준 생성물 식별자
      createdAt: number;
    }
  | {
      id: string;
      role: "system";
      imageUrl: string; // 최초 업로드(기준 이미지)
      uploadedId: string; // 서버 업로드 ID
      createdAt: number;
    };

function uid() {
  return Math.random().toString(36).slice(2);
}

export default function useStudioChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");

  // 기준이 되는 최신 이미지의 ID와 URL(없으면 채팅 시작 전)
  const base = useMemo(() => {
    // 가장 마지막 이미지 메시지(assistant or system)를 기준으로
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.role === "assistant") {
        return {
          kind: "generated" as const,
          id: m.generatedId,
          url: m.imageUrl,
        };
      }
      if (m.role === "system") {
        return { kind: "uploaded" as const, id: m.uploadedId, url: m.imageUrl };
      }
    }
    return undefined;
  }, [messages]);

  // (선택) 로컬 스토리지에 세션 유지
  useEffect(() => {
    const saved = localStorage.getItem("ai-studio-chat");
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch {}
    }
  }, []);
  useEffect(() => {
    localStorage.setItem("ai-studio-chat", JSON.stringify(messages));
  }, [messages]);

  /** 1) 처음 이미지 업로드 → system 메시지로 시작 */
  const startWithFile = useCallback(async (file: File) => {
    setLoading(true);
    try {
      const up = await uploadWithPrompt(file); // { uploadedId, url }
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "system",
          imageUrl: up.url,
          uploadedId: up.uploadedId,
          createdAt: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  /** 2) 프롬프트 전송 → assistant 이미지 메시지 추가 */
  const sendPrompt = useCallback(async () => {
    if (!prompt.trim() || !base) return;
    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      text: prompt.trim(),
      createdAt: Date.now(),
    };
    setPrompt("");
    setMessages((prev) => [...prev, userMsg]);

    setLoading(true);
    try {
      // 서버에 맞춰 base id 전달 (uploaded_image_id 또는 generated_image_id 등)
      const gen = await generateFromUpload({
        uploaded_image_id: base.id,
        prompt: userMsg.text,
      }); // { generatedId, url }

      const aiMsg: ChatMessage = {
        id: uid(),
        role: "assistant",
        imageUrl: gen.url,
        generatedId: gen.generatedId,
        createdAt: Date.now(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setLoading(false);
    }
  }, [prompt, base]);

  /** 3) 결과 저장 */
  const saveLast = useCallback(async () => {
    if (!base || base.kind !== "generated") return;
    await saveGeneratedImage(base.id, { note: "save-from-chat" });
    alert("저장 완료!");
  }, [base]);

  return {
    // state
    messages,
    loading,
    prompt,
    base,

    // actions
    setPrompt,
    startWithFile,
    sendPrompt,
    saveLast,
  };
}
