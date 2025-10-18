import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/tailwind.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "ZZMUK - 로컬 숏폼 즉시 매칭",
  description: "3km 반경, 당일 수행, T+0 정산. 찍고 올리고 승인되면 바로 정산.",
  keywords: ["로컬 미션", "숏폼", "크리에이터", "즉시 정산"],
  authors: [{ name: "ZZMUK Team" }],
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
    <html lang="ko" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
