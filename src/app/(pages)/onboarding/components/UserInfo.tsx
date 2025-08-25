// src/app/(pages)/onboarding/components/UserInfo.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { checkUserByUuid, registerUser } from "@/app/_common/apis/user";

const UUID_KEY = "aistudio_uuid";

export default function UserInfo() {
  const [nickname, setNickname] = useState("");
  const [businessType, setBusinessType] = useState(""); // ✅ 서버 스펙: business_type
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<null | string>(null);
  const [error, setError] = useState<null | string>(null);
  const [storedUuid, setStoredUuid] = useState<string | null>(null);

  // 초기 uuid 로드
  useEffect(() => {
    const u = localStorage.getItem(UUID_KEY);
    if (u) setStoredUuid(u);
  }, []);

  const disabled = useMemo(
    () => loading || !nickname.trim() || !businessType.trim(),
    [loading, nickname, businessType]
  );

  const handleSubmit = async () => {
    setLoading(true);
    setStatus(null);
    setError(null);

    try {
      const localUuid = localStorage.getItem(UUID_KEY);

      // 1) uuid가 있으면 서버에 존재여부 체크
      if (localUuid) {
        try {
          const checked = await checkUserByUuid(localUuid);
          console.log("[UserInfo] check result:", checked);

          if (checked.exists && checked.uuid) {
            localStorage.setItem(UUID_KEY, checked.uuid);
            setStoredUuid(checked.uuid);
            setStatus("기존 유저 확인 완료");
            return;
          }
          // exists=false면 신규 등록으로 진행
        } catch (e: any) {
          // 네트워크/프록시 실패 등: 신규 등록 시도
          console.warn("[UserInfo] check failed, fallback to register:", e);
        }
      }

      // 2) 신규 등록 (서버 스펙에 맞게 business_type로 보냄)
      const reg = await registerUser(nickname.trim(), businessType.trim());
      // reg 구조: { success, uuid, nickname, business_type, created_at }
      if (!reg?.uuid) {
        throw new Error("서버 응답에 uuid가 없습니다.");
      }

      localStorage.setItem(UUID_KEY, reg.uuid);
      setStoredUuid(reg.uuid);
      setStatus("신규 유저 등록 완료");
      console.log("[UserInfo] uuid 저장(신규):", reg.uuid);
    } catch (e: any) {
      console.error("[UserInfo] error:", e);
      setError(e?.message ?? "요청 실패");
      alert(e?.message ?? "요청 실패");
    } finally {
      setLoading(false);
    }
  };

  const handleResetUuid = () => {
    localStorage.removeItem(UUID_KEY);
    setStoredUuid(null);
    setStatus(null);
    setError(null);
  };

  return (
    <section className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
      <h2 className="text-2xl font-bold text-white">기본정보</h2>

      <div
        className="rounded-lg text-gray-200"
        style={{
          width: 454,
          minHeight: 356,
          minWidth: 280,
          borderRadius: 12,
          backgroundColor: "rgba(33,34,37,1)",
          padding: 32,
        }}
      >
        <div className="flex flex-col gap-4">
          {/* 현재 저장된 UUID
          <div className="text-xs text-white/60">
            현재 UUID:{" "}
            {storedUuid ? (
              <span className="text-emerald-400">{storedUuid}</span>
            ) : (
              <span className="text-white/40">없음</span>
            )}
          </div> */}

          <label className="text-sm text-white/80">닉네임</label>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="예: 아기사자"
            className="px-3 py-2 rounded-md bg-[#2B2C2F] text-white outline-none"
          />

          <label className="text-sm text-white/80 mt-2">업종</label>
          <input
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            placeholder="예: 한식 / 일식 / 양식 ..."
            className="px-3 py-2 rounded-md bg-[#2B2C2F] text-white outline-none"
          />

          <div className="flex gap-2 mt-6">
            <button
              onClick={handleSubmit}
              disabled={disabled}
              className="h-10 flex-1 rounded-md bg-emerald-500 text-black hover:bg-emerald-400 disabled:opacity-50"
            >
              {loading ? "처리 중…" : "등록 / 확인"}
            </button>

            {/* <button
              type="button"
              onClick={handleResetUuid}
              disabled={loading}
              className="h-10 px-3 rounded-md bg-neutral-700 text-white hover:bg-neutral-600 disabled:opacity-50"
              title="로컬 UUID 초기화"
            >
              UUID 초기화
            </button> */}
          </div>

          {status && <p className="mt-2 text-sm text-emerald-400">{status}</p>}
          {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
        </div>
      </div>
    </section>
  );
}
