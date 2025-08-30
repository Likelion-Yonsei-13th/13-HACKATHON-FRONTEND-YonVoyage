// src/app/(pages)/onboarding/components/UserInfo.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import type { StepProps } from "./types";
import { checkUserByUuid, registerUser } from "@/app/_common/apis/user";

/** 로컬에 고정 uuid 발급/보관 */
function getUUID() {
  if (typeof window === "undefined") return "";
  const KEY = "aistudio_uuid";
  let v = localStorage.getItem(KEY);
  if (!v) {
    v = crypto.randomUUID();
    localStorage.setItem(KEY, v);
  }
  return v;
}

export default function UserInfo({ value, onChange }: StepProps) {
  // value는 사용하지 않지만, StepProps 시그니처 유지
  const [nickname, setNickname] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [loading, setLoading] = useState(false);
  const [exists, setExists] = useState<boolean | null>(null);

  const localUuid = useMemo(() => getUUID(), []);

  // 마운트 시, uuid 기준 기존 유저 존재 여부 조회(선택)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await checkUserByUuid(localUuid);
        if (!mounted) return;
        setExists(res.exists);
        // 기존 유저라면 곧바로 부모에게 uuid 전달해 다음 단계 가능
        if (res.exists && onChange) {
          onChange(res.uuid ?? localUuid);
          localStorage.setItem(
            "aistudio_user",
            JSON.stringify({ uuid: res.uuid ?? localUuid })
          );
        }
      } catch {
        // 조회 실패는 치명적이지 않으므로 무시
      }
    })();
    return () => {
      mounted = false;
    };
  }, [localUuid, onChange]);

  async function handleSubmit() {
    try {
      if (!nickname.trim()) {
        alert("닉네임을 입력해 주세요.");
        return;
      }
      if (!businessType.trim()) {
        alert("업종(유형)을 선택해 주세요.");
        return;
      }
      setLoading(true);

      // 등록(기존 존재해도 서버가 upsert 형태라면 그대로 통과, 아니라면 사전 check로 exists 반영됨)
      const res = await registerUser(
        nickname.trim(),
        businessType.trim(),
        localUuid
      );

      // 브리지/유저 정보 보관
      localStorage.setItem(
        "aistudio_user",
        JSON.stringify({
          uuid: res.uuid,
          nickname: res.nickname,
          business_type: res.business_type,
          created_at: res.created_at,
        })
      );

      // 부모(Onboarding)에 완료 신호 전달 → answers[0]에 uuid가 들어가도록
      onChange?.(res.uuid);
      alert("등록이 완료되었습니다.");
    } catch (e: any) {
      console.error("[UserInfo] register error:", e);
      alert(
        e?.message?.includes("This field is required")
          ? "필수 값이 누락되었습니다. 입력 항목을 확인해 주세요."
          : "등록에 실패했습니다. 잠시 후 다시 시도해 주세요."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="w-full max-w-[560px] mx-auto">
      <h2 className="text-2xl font-semibold mb-4">사용자 등록</h2>
      <p className="text-sm text-neutral-400 mb-6">
        로컬 기기에 발급된 UUID: <span className="font-mono">{localUuid}</span>
        {exists === true && (
          <span className="ml-2 text-emerald-500">
            이미 등록된 사용자입니다.
          </span>
        )}
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm mb-1">닉네임</label>
          <input
            className="w-full h-11 rounded-md border border-neutral-700 bg-neutral-800 px-3 outline-none"
            placeholder="예) 민서"
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
