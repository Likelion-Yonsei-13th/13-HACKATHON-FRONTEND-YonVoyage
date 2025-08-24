// src/app/page.tsx
import { TopBar } from "@/app/_common/components/top-bar";
import UnderBar from "@/app/_common/components/under-bar";
import HeroCarousel from "@/app/_common/components/HeroCarousel";
import PickGrid from "@/app/_common/components/PickGrid";
import StartCta from "@/app/_common/components/StartCta";

export default function HomePage() {
  return (
    <div>
      <TopBar />
      <HeroCarousel />
      <PickGrid moreHref="/picks" />;
      <StartCta />
      <UnderBar />
    </div>
  );
}
