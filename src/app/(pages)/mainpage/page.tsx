// src/app/page.tsx
import TopBar from "@/app/_common/components/top-bar";
import UnderBar from "@/app/_common/components/under-bar";
import HeroCarousel from "@/app/(pages)/mainpage/components/HeroCarousel";
import PickGrid from "@/app/(pages)/mainpage/components/PickGrid";
import StartCta from "@/app/(pages)/mainpage/components/StartCta";
import { SplitViewer } from "./components/SplitViewer";

export default function HomePage() {
  return (
    <div>
      <TopBar />

      <section>
        <HeroCarousel />
      </section>

      <section className="mt-[80px] md:mt-[120px]">
        <PickGrid />
      </section>

      <section className="mt-[80px] md:mt-[120px]">
        <SplitViewer />
      </section>

      <section className="mt-[80px] md:mt-[120px]">
        <StartCta />
      </section>

      <section className="mt-[80px] md:mt-[120px]">
        <UnderBar />
      </section>
    </div>
  );
}
