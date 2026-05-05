import withPWAInit from "@ducanh2912/next-pwa";

/** @type {import('next').NextConfig} */
const withPWA = withPWAInit({
  dest: "public",                // PWAに必要なファイルを書き出す場所
  cacheOnFrontEndNav: true,      // 画面遷移時にキャッシュして高速化
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,          // オンライン復帰時に自動リロード
  disable: process.env.NODE_ENV === "development", // 開発中はPWAを無効化（エラー避け）
});

export default withPWA({
  // ここに既存の設定があれば書きますが、なければこのままでOK
});