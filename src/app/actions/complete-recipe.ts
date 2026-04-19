"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { calcLevelInfo } from "@/lib/level";

export interface CompleteRecipeResult {
  success: boolean;
  xpGained: number;
  newTotalXp: number;
  oldLevel: number;
  newLevel: number;
  leveledUp: boolean;
  error?: string;
}

/**
 * レシピ完了 Server Action
 * - user_history に記録
 * - profiles.total_xp を加算
 * - レベルアップ判定
 */
export async function completeRecipe(
  recipeId: string
): Promise<CompleteRecipeResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      xpGained: 0,
      newTotalXp: 0,
      oldLevel: 1,
      newLevel: 1,
      leveledUp: false,
      error: "ログインが必要です",
    };
  }

  // レシピ取得
  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .select("xp_reward, required_level")
    .eq("id", recipeId)
    .single();

  if (recipeError || !recipe) {
    return {
      success: false,
      xpGained: 0,
      newTotalXp: 0,
      oldLevel: 1,
      newLevel: 1,
      leveledUp: false,
      error: "レシピが見つかりませんでした",
    };
  }

  // プロフィール取得
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("total_xp, level")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return {
      success: false,
      xpGained: 0,
      newTotalXp: 0,
      oldLevel: 1,
      newLevel: 1,
      leveledUp: false,
      error: "プロフィールが見つかりませんでした",
    };
  }

  const xpGained = recipe.xp_reward;
  const newTotalXp = profile.total_xp + xpGained;
  const oldLevel = calcLevelInfo(profile.total_xp).level;
  const newLevel = calcLevelInfo(newTotalXp).level;

  // user_history に挿入
  const { error: historyError } = await supabase.from("user_history").insert({
    user_id: user.id,
    recipe_id: recipeId,
    xp_gained: xpGained,
  });

  if (historyError) {
    return {
      success: false,
      xpGained: 0,
      newTotalXp: profile.total_xp,
      oldLevel,
      newLevel: oldLevel,
      leveledUp: false,
      error: "履歴の保存に失敗しました",
    };
  }

  // XP & レベル更新
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ total_xp: newTotalXp, level: newLevel })
    .eq("id", user.id);

  if (updateError) {
    return {
      success: false,
      xpGained: 0,
      newTotalXp: profile.total_xp,
      oldLevel,
      newLevel: oldLevel,
      leveledUp: false,
      error: "XPの更新に失敗しました",
    };
  }

  revalidatePath("/home");
  revalidatePath("/profile");

  return {
    success: true,
    xpGained,
    newTotalXp,
    oldLevel,
    newLevel,
    leveledUp: newLevel > oldLevel,
  };
}
