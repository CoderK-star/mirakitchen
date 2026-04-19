import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP, Nunito } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mirakitchen — 自炊のパーソナルトレーナー",
  description:
    "RPG のようにスキルを上げながら自炊力を身につける料理アプリ。レシピをこなして XP を獲得し、料理レベルを上げよう。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FF8C00",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ja"
      className={`${notoSansJP.variable} ${nunito.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-[#F8F9FA] text-gray-800 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
