import Link from "next/link";
import { ChevronRight, Star, Clock, Flame } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 pb-safe">
      {/* Hero */}
      <div className="w-full max-w-sm flex flex-col items-center gap-8 py-16">
        {/* ロゴ */}
        <div className="text-center">
          <p className="text-5xl mb-3">🍳</p>
          <h1
            className="text-4xl font-black text-[#FF8C00] leading-tight"
            style={{ fontFamily: "var(--font-nunito)" }}
          >
            Mirakitchen
          </h1>
          <p className="mt-2 text-gray-500 text-sm">自炊のパーソナルトレーナー</p>
        </div>

        {/* キャッチコピー */}
        <div className="mesh-gradient-hero rounded-2xl p-6 w-full text-center shadow-sm">
          <p className="text-lg font-bold text-gray-800 leading-snug">
            レシピをこなして XP を獲得。
            <br />
            レベルアップして自炊力を磨こう。
          </p>
        </div>

        {/* 特徴 3点 */}
        <ul className="w-full flex flex-col gap-3">
          {[
            { icon: <Star size={18} className="text-[#FF8C00]" />, text: "レベルに合ったレシピで無理なく上達" },
            { icon: <Clock size={18} className="text-[#FF8C00]" />, text: "1ステップずつ丁寧な調理モード" },
            { icon: <Flame size={18} className="text-[#FF8C00]" />, text: "完成したら XP 獲得でレベルアップ" },
          ].map(({ icon, text }) => (
            <li
              key={text}
              className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm"
            >
              {icon}
              <span className="text-sm text-gray-700">{text}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="w-full flex flex-col gap-3">
          <Link
            href="/signup"
            className="flex items-center justify-center gap-2 min-h-[52px] w-full rounded-2xl bg-[#FF8C00] text-white font-bold text-base shadow-md active:scale-95 transition"
          >
            無料で始める <ChevronRight size={20} />
          </Link>
          <Link
            href="/login"
            className="flex items-center justify-center min-h-[44px] w-full rounded-2xl border border-gray-200 bg-white text-gray-700 font-medium text-sm active:scale-95 transition"
          >
            ログイン
          </Link>
        </div>
      </div>
    </main>
  );
}
