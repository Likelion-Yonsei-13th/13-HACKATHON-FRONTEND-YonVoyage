"use client";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback, useEffect, useState } from "react";
import HeroSlide from "./HeroSlide";

type Slide = { bg: string; circle: string; title: string; desc?: string };

const slides: Slide[] = [
  {
    bg: "/svg/hero-bg1.png",
    circle: "/svg/hero-circle1.png",
    title: "플레이팅의 즐거움!",
    desc: "음식을 작품처럼 생각하는 당신을 픽플은 이해합니다. \n플레이팅을 고르는 공간, 플레이팅하는 사람들이 모인 이곳에서 몰입의\n 즐거움을 경험하세요!",
  },
  {
    bg: "/svg/hero-bg2.png",
    circle: "/svg/hero-circle2.png",
    title: "픽플둘러보기",
    desc: "픽플들이 공유한 최신 AI 플레이팅 사진을 한눈에! 최신순·업종순·나의\n 픽순으로 편리하게 볼 수 있어요. 또한 나의픽에서 유저들의 실제 \nAI프롬프트에 사용한 핵심 태그도 픽하고 활용하세요!",
  },
  {
    bg: "/svg/hero-bg3.png",
    circle: "/svg/hero-circle3.png",
    title: "AI스튜디오",
    desc: "픽플에서 예시 프롬프트로 누구나 쉽게 내 음식 사진 제작가능해요.\n전후 사진으로 비교도 훨씬 빠르게. 가게 플레이팅을 바꾸고 싶을때\n시행착오없이 효율적으로 이용하세요!",
  },
];
const Arrow = ({ dir }: { dir: "left" | "right" }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <path
      d={dir === "left" ? "M15 5 L8 12 L15 19" : "M9 5 L16 12 L9 19"}
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function HeroCarousel() {
  const [viewportRef, embla] = useEmblaCarousel(
    { loop: true, align: "start", duration: 20 },
    [Autoplay({ delay: 4000, stopOnInteraction: true, stopOnMouseEnter: true })]
  );

  const [selected, setSelected] = useState(0);
  const [snaps, setSnaps] = useState<number[]>([]);

  const onSelect = useCallback(() => {
    if (!embla) return;
    setSelected(embla.selectedScrollSnap());
  }, [embla]);

  const scrollTo = useCallback((i: number) => embla?.scrollTo(i), [embla]);
  const prev = useCallback(() => embla?.scrollPrev(), [embla]);
  const next = useCallback(() => embla?.scrollNext(), [embla]);

  useEffect(() => {
    if (!embla) return;
    setSnaps(embla.scrollSnapList());
    onSelect();
    embla.on("select", onSelect);
    embla.on("reInit", onSelect);
  }, [embla, onSelect]);

  // 얇은 꺾쇠 아이콘
  const Chevron = ({ dir }: { dir: "left" | "right" }) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path
        d={dir === "left" ? "M15 5 L8 12 L15 19" : "M9 5 L16 12 L9 19"}
        stroke="white"
        strokeOpacity="0.9"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <section className="relative mx-auto max-w-[1440px] px-4 md:px-6 lg:px-8">
      {/* 뷰포트 */}
      <div className="overflow-hidden rounded-2xl" ref={viewportRef}>
        <div className="flex touch-pan-y">
          {slides.map((s, i) => (
            <div key={i} className="min-w-0 flex-[0_0_100%]">
              <HeroSlide {...s} />
            </div>
          ))}
        </div>
      </div>

      {/* ===== 화살표: 화면 양 옆(섹션 바깥쪽 절반) ===== */}
      <button
        onClick={prev}
        aria-label="이전 슬라이드"
        className="
    absolute top-1/2 -translate-y-1/2
    left-[96px] md:left-[120px] lg:left-[140px]
    z-30 h-10 w-10 flex items-center justify-center
    bg-transparent border-none ring-0 shadow-none
    hover:opacity-100 opacity-90 focus:outline-none pointer-events-auto
  "
      >
        <Arrow dir="left" />
      </button>

      {/* 오른쪽 화살표 */}
      <button
        onClick={next}
        aria-label="다음 슬라이드"
        className="
    absolute top-1/2 -translate-y-1/2
    right-[96px] md:right-[120px] lg:right-[140px]
    z-30 h-10 w-10 flex items-center justify-center
    bg-transparent border-none ring-0 shadow-none
    hover:opacity-100 opacity-90 focus:outline-none pointer-events-auto
  "
      >
        <Arrow dir="right" />
      </button>

      {/* ===== 도트: 진짜 동그란 점 3개 ===== */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5">
        {snaps.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            aria-label={`${i + 1}번 슬라이드`}
            className={`block h-2 w-2 rounded-full leading-none appearance-none
                  ${selected === i ? "bg-white" : "bg-white/40"}`}
            type="button"
          />
        ))}
      </div>
    </section>
  );
}
