"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { AiMealPlanDraft } from "@/types";

interface SaveMealPlanResult {
  mealPlanId?: string;
  error?: string;
}

/**
 * AI生成献立を DB（meal_plans + meal_plan_items）に保存する Server Action
 */
export async function saveMealPlan(
  draft: AiMealPlanDraft,
  startDate?: string
): Promise<SaveMealPlanResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "ログインが必要です" };

  // ① meal_plans に INSERT
  const { data: plan, error: planErr } = await supabase
    .from("meal_plans")
    .insert({
      user_id: user.id,
      title: draft.planTitle,
      start_date: startDate ?? null,
    })
    .select("id")
    .single();

  if (planErr || !plan) {
    console.error("[saveMealPlan] plan insert:", planErr);
    return { error: "献立の保存に失敗しました" };
  }

  // ② meal_plan_items を構築して一括 INSERT
  const items: {
    meal_plan_id: string;
    day_index: number;
    meal_type: string;
    custom_title: string;
    note: string | null;
  }[] = [];

  for (const day of draft.days) {
    const meals = [
      { type: "breakfast", slot: day.breakfast },
      { type: "lunch", slot: day.lunch },
      { type: "dinner", slot: day.dinner },
    ] as const;

    for (const { type, slot } of meals) {
      if (!slot) continue;
      items.push({
        meal_plan_id: plan.id,
        day_index: day.day_index,
        meal_type: type,
        custom_title: slot.title,
        note: slot.note ?? null,
      });
    }
  }

  if (items.length > 0) {
    const { error: itemsErr } = await supabase
      .from("meal_plan_items")
      .insert(items);

    if (itemsErr) {
      console.error("[saveMealPlan] items insert:", itemsErr);
      return { error: "献立アイテムの保存に失敗しました" };
    }
  }

  revalidatePath("/profile");
  revalidatePath("/ai-chef");

  return { mealPlanId: plan.id };
}
