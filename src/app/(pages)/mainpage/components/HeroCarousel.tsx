// src/app/(pages)/mainpage/components/HeroCarousel.tsx
"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

const slides = ["/svg/11.png", "/svg/22.png", "/svg/33.png"];

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
    [
      Autoplay({
        delay: 4000,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    ]
  );

  const [selected, setSelected] = useState(0);
  const [snaps, setSnaps] = useState<number[]>([]);

  const onSelect = useCallback(() => {
    if (!embla) return;
    setSelected(embla.selectedScrollSnap());
  }, [embla]);

  useEffect(() => {
    if (!embla) return;
    setSnaps(embla.scrollSnapList());
    onSelect();
    embla.on("select", onSelect);
    embla.on("reInit", onSelect);
    return () => {
      embla.off("select", onSelect);
      embla.off("reInit", onSelect);
    };
  }, [embla, onSelect]);

  const prev = useCallback(() => embla?.scrollPrev(), [embla]);
  const next = useCallback(() => embla?.scrollNext(), [embla]);
  const scrollTo = useCallback((i: number) => embla?.scrollTo(i), [embla]);

  return (
    <section className="relative w-full px-6">
      {/* 뷰포트 */}
      <div className="overflow-hidden rounded-2xl" ref={viewportRef}>
        <div className="flex touch-pan-y">
          {slides.map((src, i) => (
            <div key={i} className="min-w-0 flex-[0_0_100%]">
              <div className="relative w-full aspect-[16/9]">
                <Image
                  src={src}
                  alt={`Slide ${i + 1}`}
                  fill
                  priority={i === 0}
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 좌우 화살표: 섹션 padding과 정렬되도록 left/right-6 */}
      <button
        onClick={prev}
        aria-label="이전 슬라이드"
        className="absolute top-1/2 -translate-y-1/2 left-6 z-30 h-10 w-10 flex items-center justify-center bg-transparent"
      >
        <Arrow dir="left" />
      </button>
      <button
        onClick={next}
        aria-label="다음 슬라이드"
        className="absolute top-1/2 -translate-y-1/2 right-6 z-30 h-10 w-10 flex items-center justify-center bg-transparent"
      >
        <Arrow dir="right" />
      </button>

      {/* 도트 */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5">
        {snaps.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            aria-label={`${i + 1}번 슬라이드`}
            className={`block h-2 w-2 rounded-full ${
              selected === i ? "bg-white" : "bg-white/40"
            }`}
            type="button"
          />
        ))}
      </div>
    </section>
  );
}
