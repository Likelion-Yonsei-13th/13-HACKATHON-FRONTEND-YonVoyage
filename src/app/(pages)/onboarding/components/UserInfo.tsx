// src/app/(pages)/onboarding/components/UserInfo.tsx
"use client";

import { useState } from "react";
import { checkUserByUuid, registerUser } from "@/app/_common/apis/user";

export default function UserInfo() {
  const [nickname, setNickname] = useState("");
  const [business, setBusiness] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<null | string>(null);

  const handleSubmit = async () => {
    if (!nickname.trim() || !business.trim()) {
      alert("닉네임과 업종을 입력해주세요.");
      return;
    }

    setLoading(true);
    setStatus(null);
    try {
      // 1) 로컬 uuid가 있으면 체크, 없으면 스킵
      const localUuid = localStorage.getItem("aistudio_uuid");

      if (localUuid) {
        try {
          const checked = await checkUserByUuid(localUuid);
          console.log("[UserInfo] check result:", checked);
          if (checked.exists) {
            // 그대로 사용
            localStorage.setItem("aistudio_uuid", checked.uuid!);
            setStatus("기존 유저 확인 완료");
            return;
          }
          // exists=false면 신규 등록으로 진행
        } catch (e) {
          // 체크 실패 시에도 신규 등록으로 폴백
          console.warn("[UserInfo] check failed, fallback to register:", e);
        }
      }

      // 2) 신규 등록
      const reg = await registerUser(nickname, business);
      localStorage.setItem("aistudio_uuid", reg.uuid);
      setStatus("신규 유저 등록 완료");
      console.log("[UserInfo] uuid 저장(신규):", reg.uuid);
    } catch (e: any) {
      console.error("[UserInfo] error:", e);
      alert(e?.message ?? "요청 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
      <h2 className="text-2xl font-bold text-white">기본정보</h2>

      <div
        className="rounded-lg text-gray-200"
        style={{
          width: 454,
          height: 356,
          minWidth: 280,
          borderRadius: 12,
          backgroundColor: "rgba(33,34,37,1)",
          padding: 32,
        }}
      >
        <div className="flex flex-col gap-4">
          <label className="text-sm text-white/80">닉네임</label>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="예: 아기사자"
            className="px-3 py-2 rounded-md bg-[#2B2C2F] text-white outline-none"
          />

          <label className="text-sm text-white/80 mt-2">업종</label>
          <input
            value={business}
            onChange={(e) => setBusiness(e.target.value)}
            placeholder="예: 한식"
            className="px-3 py-2 rounded-md bg-[#2B2C2F] text-white outline-none"
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-6 h-10 rounded-md bg-emerald-500 text-black hover:bg-emerald-400 disabled:opacity-50"
          >
            {loading ? "처리 중…" : "등록 / 확인"}
          </button>

          {status && <p className="mt-2 text-sm text-emerald-400">{status}</p>}
        </div>
      </div>
    </section>
  );
}
