"use client";

type Props = {
  bg: string; // 배경 이미지 경로
  circle: string; // 원형 이미지 경로
  title: string; // 제목
  desc?: string; // 본문 (줄바꿈은 \n 사용 가능)
};

export default function HeroSlide({ bg, circle, title, desc }: Props) {
  return (
    <div className="relative h-[620px] lg:h-[660px] overflow-hidden rounded-2xl">
      {/* 배경 */}
      <img
        src={bg}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* 어둡게 + 좌->우 그라데이션 */}
      <div className="absolute inset-0 bg-black/25" />

      {/* ---- 텍스트 (왼쪽 140px 근처) ---- */}
      <div
        className="
        absolute top-1/2 -translate-y-1/2
        left-[350px] md:left-[120px] lg:left-[200px]
        w-full max-w-[600px]
      "
      >
        <h1 className="whitespace-pre-line text-white font-extrabold leading-tight text-[44px] lg:text-[56px]">
          {title}
        </h1>
        {desc && (
          <p className="whitespace-pre-line mt-5 whitespace-pre-line text-white/85 text-[15px] lg:text-[16px] leading-[1.75]">
            {desc}
          </p>
        )}
      </div>

      {/* ---- 원형 이미지 (오른쪽 180~220px, 중앙보다 살짝 위) ---- */}
      <figure
        className="
          absolute z-10
          top-[46%] -translate-y-1/2
          right-[180px] md:right-[180px] lg:right-[220px]
          h-[350px] w-[350px] md:h-[340px] md:w-[340px] lg:h-[360px] lg:w-[360px]
          rounded-full overflow-hidden
          shadow-[0_20px_60px_rgba(0,0,0,0.45)]
        "
      >
        <img src={circle} alt="" className="h-full w-full object-cover" />
      </figure>
    </div>
  );
}
