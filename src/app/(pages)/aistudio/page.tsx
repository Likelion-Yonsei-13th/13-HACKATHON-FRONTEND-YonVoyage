// src/app/(pages)/aistudio/page.tsx
"use client";

import UploadDropzone from "./components/UploadDropzone";
import MessageList from "./components/MessageList";
import ChatInput from "./components/ChatInput";
import Spinner from "./components/Spinner";
import useStudioChat from "./hooks/useStudioChat";

export default function AiStudioChatPage() {
  const chat = useStudioChat();

  const hasStarted = Boolean(chat.base); // 기준 이미지 업로드 완료 여부
  const canSend = hasStarted && !chat.loading && chat.prompt.trim().length > 0;

  // 업로드 전엔 채팅 리스트에 안내 시스템 메시지 1개를 보여줘도 UX가 좋아요.
  const placeholderMessages = [
    {
      id: "placeholder",
      role: "system" as const,
      content: "시작 이미지를 업로드하면 여기서 AI와 대화를 이어갈 수 있어요.",
    },
  ];

  return (
    <section className="space-y-5">
      <h1 className="text-xl font-bold">AI 스튜디오</h1>

      {/* 항상 업로드 영역은 보여줌 */}
      <div className="rounded-xl border p-4">
        <div className="mb-3 text-sm text-gray-600">
          작업 시작 이미지 업로드
        </div>
        <UploadDropzone
          disabled={chat.loading}
          onSelectFile={(f) => chat.startWithFile(f)}
        />
      </div>

      {/* 항상 채팅 영역도 보여줌 */}
      <div className="rounded-xl border bg-gray-50 p-3 min-h-[40vh]">
        {chat.loading ? (
          <Spinner />
        ) : (
          <MessageList
            items={hasStarted ? chat.messages : placeholderMessages}
          />
        )}
      </div>

      {/* 하단 채팅 입력: 업로드 전엔 비활성화 + 안내 문구 */}
      <div className="sticky bottom-0 rounded-xl border bg-white p-3">
        {!hasStarted && (
          <p className="mb-2 text-xs text-gray-500">
            시작 이미지를 업로드하면 입력창이 활성화됩니다.
          </p>
        )}
        <ChatInput
          value={chat.prompt}
          onChange={chat.setPrompt}
          onSend={() => hasStarted && chat.sendPrompt()} // 업로드 전엔 전송 막기
          disabled={!hasStarted || chat.loading || !canSend}
        />

        <div className="mt-2 flex justify-end">
          <button
            className="text-sm text-gray-600 underline disabled:opacity-40"
            onClick={chat.saveLast}
            disabled={!hasStarted || chat.base?.kind !== "generated"}
          >
            마지막 결과 저장
          </button>
        </div>
      </div>
    </section>
  );
}
