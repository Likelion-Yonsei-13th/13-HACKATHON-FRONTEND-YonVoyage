// src/app/page.tsx
import TopBar from "@/app/_common/components/top-bar";
import UnderBar from "@/app/_common/components/under-bar";
import HeroCarousel from "@/app/(pages)/mainpage/components/HeroCarousel";
import PickGrid from "@/app/(pages)/mainpage/components/PickGrid";
import StartCta from "@/app/(pages)/mainpage/components/StartCta";

export default function HomePage() {
  return (
    <div>
      <TopBar />
      <HeroCarousel />

      <section className="mt-[120px] md:mt-[160px]">
        <PickGrid moreHref="/picks" />
      </section>

      <section className="mt-[120px] md:mt-[160px]">
        <StartCta />
      </section>
      <section className="mt-[120px] md:mt-[160px]">
        <UnderBar />
      </section>
    </div>
  );
}
