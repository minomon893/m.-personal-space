import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ここを書き換えます
export const metadata = {
  title: "m. personal space",
  description: "地味で愛しいソロ生活とメタ認知の記録",
  manifest: "/manifest.json", // マニフェストファイルを読み込む設定
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "m.space",
    // ここで iPhone 用のアイコンを指定します
  },
  icons: {
    apple: "/m.jpg", 
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="ja" // せっかくなので en から ja にしておきましょう
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}