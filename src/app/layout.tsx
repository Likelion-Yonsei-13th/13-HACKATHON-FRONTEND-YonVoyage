import "@/styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "모바일 레이아웃 테스트",
  description: "중앙 정렬 모바일 레이아웃",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        {/* 중앙 모바일 캔버스 */}
        <div className="app-shell shadow-lg">{children}</div>
      </body>
    </html>
  );
}
