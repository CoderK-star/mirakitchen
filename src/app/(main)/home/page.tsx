import { redirect } from "next/navigation";
import { ChevronRight, Flame, BookOpen } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { calcLevelInfo } from "@/lib/level";
import { LevelBadge } from "@/components/shared/LevelBadge";
import { XpProgressBar } from "@/components/shared/XpProgressBar";
import type { Recipe } from "@/types";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // プロフィール取得
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // おすすめレシピ取得（ユーザーレベル以下で最初の1件）
  const userLevel = profile?.level ?? 1;
  const { data: featuredRecipe } = await supabase
    .from("recipes")
    .select("*")
    .lte("required_level", userLevel)
    .order("xp_reward", { ascending: false })
    .limit(1)
    .maybeSingle<Recipe>();

  const levelInfo = calcLevelInfo(profile?.total_xp ?? 0);

  return (
    <div className="px-4 pt-6 pb-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-gray-500">おかえり、</p>
          <h2 className="text-lg font-bold text-gray-800">
            {profile?.username ?? "シェフ"} さん 👋
          </h2>
        </div>
        <LevelBadge level={levelInfo.level} size="lg" />
      </div>

      {/* BentoGrid (DESIGN.md §5.8) */}
      <div className="grid grid-cols-2 gap-3">

        {/* ① ヒーローカード（今日のおすすめ）col-span-2 */}
        <div className="col-span-2 rounded-2xl overflow-hidden relative aspect-[2/1] mesh-gradient-hero shadow-sm">
          <div className="absolute inset-0 flex flex-col justify-end p-4">
            {featuredRecipe ? (
              <>
                <p className="text-xs font-medium text-[#FF8C00] bg-white/80 rounded-full px-2 py-0.5 w-fit mb-1">
                  今日のおすすめ
                </p>
                <p className="text-lg font-bold text-gray-800 leading-tight">
                  {featuredRecipe.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <LevelBadge level={featuredRecipe.required_level} size="sm" />
                  <span className="text-xs text-gray-600">
                    {featuredRecipe.prep_time}分
                  </span>
                  <span className="text-xs text-[#A7C957] font-bold">
                    +{featuredRecipe.xp_reward} XP
                  </span>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-600">レシピを探してみよう 🍳</p>
            )}
          </div>
          {featuredRecipe && (
            <Link
              href={`/recipes/${featuredRecipe.id}`}
              className="absolute inset-0"
              aria-label={`${featuredRecipe.title}の詳細を見る`}
            />
          )}
        </div>

        {/* ② レベル・XP カード */}
        <div className="col-span-1 rounded-2xl bg-white shadow-sm p-4 flex flex-col gap-3 aspect-square">
          <div className="flex items-center gap-1">
            <Flame size={16} className="text-[#FF8C00]" />
            <span className="text-xs font-bold text-gray-500">レベル</span>
          </div>
          <p
            className="text-4xl font-black text-[#FF8C00]"
            style={{ fontFamily: "var(--font-nunito)" }}
          >
            {levelInfo.level}
          </p>
          <XpProgressBar
            currentXp={levelInfo.currentXp}
            nextLevelXp={levelInfo.nextLevelXp}
            className="mt-auto"
          />
        </div>

        {/* ③ クイックアクション（レシピを探す）*/}
        <Link
          href="/recipes"
          className="col-span-1 rounded-2xl bg-[#FF8C00] shadow-sm p-4 flex flex-col justify-between aspect-square active:scale-95 transition"
        >
          <span className="text-2xl">🍽️</span>
          <div>
            <p className="text-white font-bold text-sm leading-tight">
              レシピを
              <br />
              探す
            </p>
            <ChevronRight size={16} className="text-white/80 mt-1" />
          </div>
        </Link>

        {/* ④ 食材辞書 */}
        <Link
          href="/ingredients"
          className="col-span-1 rounded-2xl bg-[#EFF8E2] shadow-sm p-4 flex flex-col justify-between aspect-square active:scale-95 transition"
        >
          <BookOpen size={20} className="text-[#A7C957]" />
          <div>
            <p className="text-gray-700 font-bold text-sm leading-tight">
              食材
              <br />
              辞書
            </p>
            <ChevronRight size={16} className="text-[#A7C957] mt-1" />
          </div>
        </Link>

        {/* ⑤ Tips (col-span-2) */}
        <div className="col-span-2 rounded-2xl bg-white shadow-sm p-4 flex items-center gap-3">
          <span className="text-2xl shrink-0">💡</span>
          <div>
            <p className="text-xs font-bold text-gray-700">今日の Tips</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
              「中火」とはフライパンを手で触れる高さで5秒キープできる火加減です。
              炎がフライパンの底に軽く触れる程度が目安。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
