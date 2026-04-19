import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RecipeCard } from "@/components/recipe/RecipeCard";
import type { RecipeCardData, RecipeCategory } from "@/types";

const CATEGORIES: RecipeCategory[] = [
  "包丁不要",
  "レンジのみ",
  "フライパン1つ",
  "鍋1つ",
  "混ぜるだけ",
];

interface RecipesPageProps {
  searchParams: Promise<{ category?: string; level?: string }>;
}

export default async function RecipesPage({ searchParams }: RecipesPageProps) {
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

  const params = await searchParams;
  const selectedCategory = params.category as RecipeCategory | undefined;
  const levelFilter = params.level; // "available" | undefined

  let query = supabase
    .from("recipes")
    .select(
      "id, title, description, difficulty_level, prep_time, image_url, category, required_level, xp_reward"
    )
    .order("required_level", { ascending: true })
    .order("xp_reward", { ascending: false });

  if (selectedCategory) {
    query = query.eq("category", selectedCategory);
  }
  if (levelFilter === "available") {
    query = query.lte("required_level", userLevel);
  }

  const { data: recipes } = await query.returns<RecipeCardData[]>();

  return (
    <div className="pt-6 pb-4">
      {/* ヘッダー */}
      <div className="px-4 mb-4">
        <h1 className="text-2xl font-bold text-gray-800">レシピ</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          あなたのレベル:{" "}
          <span className="font-bold text-[#FF8C00]">Lv.{userLevel}</span>
        </p>
      </div>

      {/* レベルフィルター */}
      <div className="px-4 mb-3 flex gap-2">
        <FilterChip
          label="すべて"
          href="/recipes"
          active={levelFilter !== "available"}
        />
        <FilterChip
          label="今すぐ作れる"
          href="/recipes?level=available"
          active={levelFilter === "available"}
        />
      </div>

      {/* カテゴリフィルター */}
      <div className="px-4 mb-4 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <FilterChip
          label="全カテゴリ"
          href={levelFilter === "available" ? "/recipes?level=available" : "/recipes"}
          active={!selectedCategory}
          small
        />
        {CATEGORIES.map((cat) => {
          const href = `/recipes?category=${encodeURIComponent(cat)}${levelFilter === "available" ? "&level=available" : ""}`;
          return (
            <FilterChip
              key={cat}
              label={cat}
              href={href}
              active={selectedCategory === cat}
              small
            />
          );
        })}
      </div>

      {/* レシピグリッド */}
      {!recipes || recipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="text-5xl">🥦</span>
          <p className="text-gray-500 text-sm">レシピが見つかりませんでした</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-4">
          {recipes.map((recipe, i) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              userLevel={userLevel}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** フィルターチップ */
function FilterChip({
  label,
  href,
  active,
  small = false,
}: {
  label: string;
  href: string;
  active: boolean;
  small?: boolean;
}) {
  return (
    <a
      href={href}
      className={
        small
          ? `shrink-0 rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
              active
                ? "bg-[#FF8C00] text-white border-[#FF8C00]"
                : "bg-white text-gray-600 border-gray-200"
            }`
          : `rounded-full px-4 py-1.5 text-sm font-bold border transition-colors ${
              active
                ? "bg-[#FF8C00] text-white border-[#FF8C00]"
                : "bg-white text-gray-600 border-gray-200"
            }`
      }
    >
      {label}
    </a>
  );
}
