/**
 * POST /api/ai/meal-plan
 * Gemini に指定日数の献立を生成させる
 */
import { NextRequest, NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/google-ai";
import { createClient } from "@/lib/supabase/server";
import type { AiMealPlanDraft } from "@/types";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { days, level, preferences } = (await req.json()) as {
    days: 3 | 5 | 7;
    level: number;
    preferences?: string;
  };

  const prefText = preferences
    ? `【好み・制約】 ${preferences}`
    : "【好み・制約】 特になし";

  const prompt = `
あなたは日本の一人暮らし向け料理アドバイザーです。
${days}日分の献立（朝食・昼食・夕食）を考えてください。

【ユーザーのレベル】 ${level} / 5（1=完全初心者）
${prefText}
【条件】
- 同じ料理を繰り返さないこと
- 一人暮らし向けの量・コスト感
- レベルに合った難易度の料理

必ず以下のJSON形式のみで返答してください（他の文章は不要）:
{
  "planTitle": "献立タイトル（例: 5日間の節約レシピプラン）",
  "days": [
    {
      "day_index": 0,
      "breakfast": {
        "title": "料理名",
        "description": "短い説明",
        "prep_time": 数値（分）,
        "category": "カテゴリ名",
        "note": "メモ（なければnull）"
      },
      "lunch": { 同上 },
      "dinner": { 同上 }
    }
  ]
}

カテゴリは以下のいずれか: 包丁不要, レンジのみ, フライパン1つ, 鍋1つ, 混ぜるだけ
`.trim();

  try {
    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AIからの応答が不正なフォーマットでした");

    const draft = JSON.parse(jsonMatch[0]) as AiMealPlanDraft;

    if (!draft.planTitle || !Array.isArray(draft.days)) {
      throw new Error("生成された献立データが不完全です");
    }

    return NextResponse.json({ draft });
  } catch (err) {
    console.error("[meal-plan]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "生成に失敗しました" },
      { status: 500 }
    );
  }
}
