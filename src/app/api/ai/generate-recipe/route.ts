/**
 * POST /api/ai/generate-recipe
 * Gemini に指定条件でレシピを生成させる
 */
import { NextRequest, NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/google-ai";
import { createClient } from "@/lib/supabase/server";
import type { AiRecipeDraft, RecipeCategory, DifficultyLevel } from "@/types";

export async function POST(req: NextRequest) {
  // 認証確認
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { preferences, level, category } = (await req.json()) as {
    preferences: string;
    level: number;
    category?: RecipeCategory;
  };

  const categoryGuide = category
    ? `カテゴリは必ず「${category}」にすること。`
    : `カテゴリは以下のいずれか: 包丁不要, レンジのみ, フライパン1つ, 鍋1つ, 混ぜるだけ`;

  const prompt = `
あなたは日本の一人暮らし向け料理アドバイザーです。
以下の条件でレシピを1件考えてください。

【ユーザーのレベル】 ${level} / 5（1=完全初心者、5=中級者）
【ユーザーのリクエスト】 ${preferences}
【カテゴリ条件】 ${categoryGuide}
【難易度条件】 ユーザーレベル ${level} に合った難易度（1〜5）にすること

必ず以下のJSON形式のみで返答してください（他の文章は不要）:
{
  "title": "料理名",
  "description": "1〜2行の説明文",
  "difficulty_level": 数値(1-5),
  "prep_time": 分単位の数値,
  "category": "カテゴリ名",
  "required_level": 数値(1-5),
  "xp_reward": 数値(50-200),
  "steps": [
    {
      "step_number": 1,
      "instruction": "手順の説明",
      "tip": "コツや注意点（なければnull）"
    }
  ]
}
`.trim();

  try {
    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // JSON 部分を抽出（マークダウンコードブロックを除去）
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AIからの応答が不正なフォーマットでした");
    }

    const draft = JSON.parse(jsonMatch[0]) as AiRecipeDraft;

    // 基本的な型チェック
    if (!draft.title || !draft.steps || !Array.isArray(draft.steps)) {
      throw new Error("生成されたレシピのデータが不完全です");
    }

    return NextResponse.json({ draft });
  } catch (err) {
    console.error("[generate-recipe]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "生成に失敗しました" },
      { status: 500 }
    );
  }
}
