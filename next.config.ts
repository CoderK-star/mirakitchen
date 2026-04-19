import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Turbopack が上位の package-lock.json を検出してルートを誤認識するため、
  // プロジェクトディレクトリを明示的に指定する
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        // Supabase Storage（画像キャッシュ用）
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        // Google / Imagen 生成画像（direct URL の場合）
        protocol: "https",
        hostname: "*.googleapis.com",
      },
    ],
  },
};

export default nextConfig;
