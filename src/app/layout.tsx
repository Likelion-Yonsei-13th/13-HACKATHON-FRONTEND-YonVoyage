import "@/styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pixpl",
  description: "AI 음식 사진 보정 서비스",
    icons: {
        icon: "/favicon.png",
    }
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
