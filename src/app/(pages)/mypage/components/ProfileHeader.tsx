// src/app/(pages)/mypage/_components/profile-header.tsx
"use client";
import Image from "next/image";

type Props = {
  nickname: string;
  avatarUrl?: string; // 이미지 파일 경로
  received: number;
  picked: number;
};

export default function ProfileHeader({
  nickname,
  avatarUrl,
  received,
  picked,
}: Props) {
  return (
    <section className="mx-auto max-w-[1440px] h-[490px] flex items-center justify-center">
      <div className="flex flex-col items-center">
        {/* 이미지가 있으면 사용 */}
        {avatarUrl ? (
          <div className="relative w-20 h-20">
            <Image
              src={avatarUrl}
              alt={`${nickname} 아바타`}
              width={90}
              height={90}
              className="rounded-full object-cover ring-4 ring-black/30"
              priority
            />
          </div>
        ) : (
          // (옵션) 이미지가 없을 때만 이니셜 원형
          <div className="w-20 h-20 rounded-full grid place-items-center bg-green-500 text-black text-3xl font-extrabold ring-4 ring-black/30">
            M
          </div>
        )}

        <h1 className="mt-6 text-2xl font-semibold">{nickname}</h1>
        <div className="mt-4 flex flex-col items-center gap-1 text-lg text-white/85">
          <span>
            받은 픽수 : <b className="text-white">{received}</b>개
          </span>
          <span>
            고른픽수 : <b className="text-white">{picked}</b>개
          </span>
        </div>
      </div>
    </section>
  );
}
