// src/app/layout.tsx
import "@/styles/globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Pixpl",
  description: "AI 음식 사진 보정 서비스",
  icons: { icon: "/favicon.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      {/* min-h-dvh + flex 컬럼로 전체 페이지가 화면 높이를 채우도록 */}
      <body className="min-h-dvh flex flex-col bg-[#0a0a0a] text-[#ededed]">
        {/* 중앙 컨테이너: 좌우 패딩과 최대폭만 관리 */}
        <div className="app-shell flex-1 w-full">{children}</div>
      </body>
    </html>
  );
}
