import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CookingMode } from "@/components/recipe/CookingMode";
import type { RecipeWithSteps } from "@/types";

interface CookPageProps {
  params: Promise<{ id: string }>;
}

export default async function CookPage({ params }: CookPageProps) {
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

  const { data: recipe } = await supabase
    .from("recipes")
    .select("*, recipe_steps(*)")
    .eq("id", id)
    .order("step_number", { referencedTable: "recipe_steps", ascending: true })
    .single<RecipeWithSteps>();

  if (!recipe) notFound();

  // レベル未達の場合は詳細ページへリダイレクト
  if (recipe.required_level > (profile?.level ?? 1)) {
    redirect(`/recipes/${id}`);
  }

  return <CookingMode recipe={recipe} />;
}
