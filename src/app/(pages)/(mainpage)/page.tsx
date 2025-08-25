// src/app/page.tsx
import TopBar from "@/app/_common/components/top-bar";
import UnderBar from "@/app/_common/components/under-bar";
import { SplitViewer } from "./components/SplitViewer";
export default function HomePage() {
  return (
    <div>
      <TopBar />
      <SplitViewer />
      <UnderBar />
    </div>
  );
}
