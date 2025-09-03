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
      if (exists === true) {
        if (!sentUpRef.current) {
          sentUpRef.current = true;
          onChange?.(localUuid);
        }
        alert("이미 등록된 사용자입니다.");
        return;
      }

      const reg = await registerUser({
        uuid: localUuid,
        nickname: nickname.trim(),
        business_type: businessType.trim(), // ✅ 영어 value 그대로 전송
        is_profile_public: true,
      });

      setUUID(reg.uuid);
      localStorage.setItem(
        "aistudio_user",
        JSON.stringify({
          uuid: reg.uuid,
          nickname: reg.nickname,
          business_type: reg.business_type,
          created_at: reg.created_at,
        })
      );

      if (!sentUpRef.current) {
        sentUpRef.current = true;
        onChange?.(reg.uuid);
      }
      alert("등록이 완료되었습니다.");
    } catch (e: any) {
      console.error("[UserInfo] register error:", e);
      alert(e?.message || "등록에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  function handleNewUuid() {
    const v = forceNewUUID();
    alert(`새 테스트 UUID가 발급되었습니다.\n${v}\n다시 등록해 주세요.`);
    location.reload();
  }

  return (
    <section className="w-full max-w-[560px] mx-auto">
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
            {/* ✅ value는 영어, 라벨은 한글 */}
            <option value="korean food">한식</option>
            <option value="japanese food">일식</option>
            <option value="western food">양식</option>
            <option value="chinese food">중식</option>
            <option value="dessert">디저트</option>
            <option value="bakery">베이커리</option>
            <option value="cafe">카페</option>
            <option value="fastfood">패스트푸드</option>
            <option value="fusion">퓨전</option>
            <option value="salad">채식</option>
            <option value="bar">바</option>
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
