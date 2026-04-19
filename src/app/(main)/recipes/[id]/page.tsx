import { redirect, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Clock, ChevronRight, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { LevelBadge } from "@/components/shared/LevelBadge";
import type { RecipeWithSteps } from "@/types";

interface RecipeDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function RecipeDetailPage({ params }: RecipeDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("level")
    .eq("id", user.id)
    .single();

  const userLevel = profile?.level ?? 1;

  const { data: recipe } = await supabase
    .from("recipes")
    .select("*, recipe_steps(*)")
    .eq("id", id)
    .order("step_number", { referencedTable: "recipe_steps", ascending: true })
    .single<RecipeWithSteps>();

  if (!recipe) notFound();

  const isLocked = recipe.required_level > userLevel;

  return (
    <div className="pb-8">
      {/* ヒーロー画像 */}
      <div className="relative w-full aspect-[4/3] bg-gray-100">
        {recipe.image_url ? (
          <Image
            src={recipe.image_url}
            alt={recipe.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            🍳
          </div>
        )}
        {/* グラスパネル (DESIGN.md §5.7) */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/70 backdrop-blur-md border-t border-white/40 px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <LevelBadge level={recipe.required_level} size="sm" />
            <span className="flex items-center gap-1 text-xs text-gray-600">
              <Clock size={12} />
              {recipe.prep_time}分
            </span>
            <span className="text-xs font-bold text-[#A7C957] ml-auto">
              +{recipe.xp_reward} XP
            </span>
          </div>
          <h1 className="text-xl font-bold text-gray-800 leading-tight">
            {recipe.title}
          </h1>
        </div>
      </div>

      {/* 説明 */}
      {recipe.description && (
        <div className="px-4 pt-4">
          <p className="text-sm text-gray-600 leading-relaxed">{recipe.description}</p>
        </div>
      )}

      {/* カテゴリ */}
      <div className="px-4 pt-3">
        <span className="text-xs bg-orange-50 text-[#FF8C00] border border-orange-200 rounded-full px-3 py-1 font-medium">
          {recipe.category}
        </span>
      </div>

      {/* 手順サマリー */}
      <div className="px-4 pt-5">
        <h2 className="text-base font-bold text-gray-800 mb-3">
          調理手順（{recipe.recipe_steps.length}ステップ）
        </h2>
        <ol className="flex flex-col gap-2">
          {recipe.recipe_steps.map((step) => (
            <li
              key={step.id}
              className="flex items-start gap-3 bg-white rounded-xl p-3 shadow-sm"
            >
              <span className="shrink-0 w-6 h-6 rounded-full bg-[#FF8C00] text-white text-xs font-bold flex items-center justify-center mt-0.5">
                {step.step_number}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {step.instruction}
                </p>
                {step.tip && (
                  <p className="text-xs text-[#FF8C00] mt-1.5 bg-orange-50 rounded-lg px-2 py-1">
                    💡 {step.tip}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* 調理開始ボタン */}
      <div className="px-4 pt-6">
        {isLocked ? (
          <div className="w-full h-16 rounded-2xl bg-gray-100 flex items-center justify-center gap-2 text-gray-400">
            <CheckCircle2 size={20} />
            <span className="font-bold text-sm">
              Lv.{recipe.required_level} で解放されます
            </span>
          </div>
        ) : (
          <Link
            href={`/recipes/${recipe.id}/cook`}
            className="flex items-center justify-center gap-2 w-full h-16 rounded-2xl bg-[#FF8C00] text-white font-bold text-base shadow-md active:scale-95 transition min-h-[44px]"
          >
            調理を開始する
            <ChevronRight size={20} />
          </Link>
        )}
      </div>
    </div>
  );
}
