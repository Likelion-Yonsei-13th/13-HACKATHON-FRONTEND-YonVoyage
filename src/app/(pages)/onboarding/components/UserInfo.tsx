// src/app/(pages)/onboarding/components/UserInfo.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { StepProps } from "./types";
import { checkUserByUuid, registerUser } from "@/app/_common/apis/user";
import {
  getOrCreateUUID,
  setUUID,
  forceNewUUID,
} from "@/app/_common/utils/uuid";

export default function UserInfo({ onChange }: StepProps) {
  const [nickname, setNickname] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [loading, setLoading] = useState(false);
  const [exists, setExists] = useState<boolean | null>(null);

  const localUuid = useMemo(() => getOrCreateUUID(), []);
  const checkedOnceRef = useRef(false);
  const sentUpRef = useRef(false);

  useEffect(() => {
    if (!localUuid || checkedOnceRef.current) return;
    checkedOnceRef.current = true;

    let cancelled = false;
    (async () => {
      try {
        const r = await checkUserByUuid(localUuid);
        if (cancelled) return;
        setExists(r.exists);
        if (r.uuid && r.uuid !== localUuid) setUUID(r.uuid);
        if (r.exists && !sentUpRef.current) {
          sentUpRef.current = true;
          onChange?.(r.uuid ?? localUuid);
          localStorage.setItem(
            "aistudio_user",
            JSON.stringify({ uuid: r.uuid ?? localUuid })
          );
        }
      } catch {}
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localUuid]);

  async function handleSubmit() {
    if (!nickname.trim()) return alert("닉네임을 입력해 주세요.");
    if (!businessType.trim()) return alert("업종(유형)을 선택해 주세요.");

    setLoading(true);
    try {
      const res = await registerUser(
        nickname.trim(),
        businessType.trim(),
        localUuid
      );

      setUUID(res.uuid);
      localStorage.setItem(
        "aistudio_user",
        JSON.stringify({
          uuid: res.uuid,
          nickname: res.nickname,
          business_type: res.business_type,
          created_at: res.created_at,
        })
      );

      if (!sentUpRef.current) {
        sentUpRef.current = true;
        onChange?.(res.uuid);
      }
      alert("등록이 완료되었습니다.");
    } catch (e: any) {
      console.error("[UserInfo] register error:", e);
      alert("등록에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  /** 개발 모드: 새 테스트 UUID 발급 */
  function handleNewUuid() {
    const v = forceNewUUID();
    alert(`새 테스트 UUID가 발급되었습니다.\n${v}\n다시 등록해 주세요.`);
    // 화면만 새로고침(선택)
    location.reload();
  }

  return (
    <section className="w-full max-w-[560px] mx-auto">
      <h2 className="text-2xl font-semibold mb-4">사용자 등록</h2>
      <p className="text-sm text-neutral-400 mb-6">
        로컬 UUID: <span className="font-mono break-all">{localUuid}</span>
        {exists === true && (
          <span className="ml-2 text-emerald-500">
            이미 등록된 사용자입니다.
          </span>
        )}
      </p>

      {/* 개발에서만 노출하면 좋아요 */}
      {process.env.NODE_ENV === "development" && (
        <button
          type="button"
          onClick={handleNewUuid}
          className="mb-4 h-9 px-3 rounded-md border border-white/20 text-xs text-white/80 hover:bg-white/10"
        >
          새 테스트 UUID 발급 (Dev)
        </button>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm mb-1">닉네임</label>
          <input
            className="w-full h-11 rounded-md border border-neutral-700 bg-neutral-800 px-3 outline-none"
            placeholder="예) 아기사자"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={30}
          />
        </div>

        <div>
          <label className="block text-sm mb-1">업종(유형)</label>
          <select
            className="w-full h-11 rounded-md border border-neutral-700 bg-neutral-800 px-3 outline-none"
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
          >
            <option value="">선택하세요</option>
            <option value="restaurant">음식점</option>
            <option value="cafe">카페</option>
            <option value="retail">리테일</option>
            <option value="creator">크리에이터/미디어</option>
            <option value="other">기타</option>
          </select>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-11 rounded-md bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-60"
        >
          {loading ? "등록 중…" : "등록하기"}
        </button>
      </div>
    </section>
  );
}
