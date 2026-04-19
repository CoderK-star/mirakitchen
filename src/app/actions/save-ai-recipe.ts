"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { AiRecipeDraft } from "@/types";

interface SaveAiRecipeInput {
  draft: AiRecipeDraft;
  /** 既に生成済みの画像 URL（未生成なら undefined） */
  imageUrl?: string;
}

interface SaveAiRecipeResult {
  recipeId?: string;
  error?: string;
}

/**
 * AI生成レシピを DB（recipes + recipe_steps）に保存する Server Action
 */
export async function saveAiRecipe(
  input: SaveAiRecipeInput
): Promise<SaveAiRecipeResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "ログインが必要です" };

  const { draft, imageUrl } = input;

  // ① レシピ本体を INSERT
  const { data: recipe, error: recipeErr } = await supabase
    .from("recipes")
    .insert({
      title: draft.title,
      description: draft.description,
      difficulty_level: draft.difficulty_level,
      prep_time: draft.prep_time,
      category: draft.category,
      required_level: draft.required_level,
      xp_reward: draft.xp_reward,
      image_url: imageUrl ?? null,
      created_by: user.id,
      is_ai_generated: true,
    })
    .select("id")
    .single();

  if (recipeErr || !recipe) {
    console.error("[saveAiRecipe] recipe insert:", recipeErr);
    return { error: "レシピの保存に失敗しました" };
  }

  // ② ステップを一括 INSERT
  const steps = draft.steps.map((s) => ({
    recipe_id: recipe.id,
    step_number: s.step_number,
    instruction: s.instruction,
    tip: s.tip ?? null,
    image_url: null,
  }));

  const { error: stepsErr } = await supabase.from("recipe_steps").insert(steps);

  if (stepsErr) {
    console.error("[saveAiRecipe] steps insert:", stepsErr);
    // ステップ保存失敗時はレシピも削除して整合性を保つ
    await supabase.from("recipes").delete().eq("id", recipe.id);
    return { error: "レシピステップの保存に失敗しました" };
  }

  revalidatePath("/recipes");
  revalidatePath("/home");

  return { recipeId: recipe.id };
}

/**
 * AI生成レシピを保存後、詳細ページにリダイレクト
 */
export async function saveAiRecipeAndRedirect(input: SaveAiRecipeInput) {
  const result = await saveAiRecipe(input);
  if (result.error) {
    throw new Error(result.error);
  }
  redirect(`/recipes/${result.recipeId}`);
}
