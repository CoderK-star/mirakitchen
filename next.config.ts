import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Turbopack が上位の package-lock.json を検出してルートを誤認識するため、
  // プロジェクトディレクトリを明示的に指定する
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
