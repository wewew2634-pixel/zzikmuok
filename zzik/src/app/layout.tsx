import type { Metadata } from "next";
import "@/styles/globals.css";

// Use system fonts (no Google Fonts fetch)
const inter = {
  variable: '--font-sans',
  className: ''
};

export const metadata: Metadata = {
  title: "ZZMUK - 로컬 숏폼 즉시 매칭",
  description: "3km 반경, 당일 수행, T+0 정산. 근처 크리에이터와 상점을 5분 내 연결합니다.",
  keywords: ["로컬 숏폼", "크리에이터 매칭", "T+0 정산", "ZZMUK"],
  authors: [{ name: "ZZMUK" }],
  openGraph: {
    title: "ZZMUK - 로컬 숏폼 즉시 매칭",
    description: "3km 반경, 당일 수행, T+0 정산",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${inter.variable} dark`}>
      <body>{children}</body>
    </html>
  );
}
