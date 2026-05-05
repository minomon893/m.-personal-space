import withPWAInit from "@ducanh2912/next-pwa";

/** @type {import('next').NextConfig} */
const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
});

export default withPWA({
  // これが重要！Turbopackとの衝突を回避します
  turbopack: {}, 
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
});