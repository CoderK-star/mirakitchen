/**
 * POST /api/ai/search-recipes
 * Gemini の Grounding with Google Search を使ってWeb上のレシピを検索・要約する
 */
import { NextRequest, NextResponse } from "next/server";
import { getGoogleAI } from "@/lib/google-ai";
import { createClient } from "@/lib/supabase/server";
import type { WebSearchRecipe } from "@/types";
// Gemini grounding 用の型（SDK の内部型）
import type { GenerateContentRequest } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { query } = (await req.json()) as { query: string };
  if (!query?.trim()) {
    return NextResponse.json({ error: "検索ワードを入力してください" }, { status: 400 });
  }

  try {
    const genAI = getGoogleAI();

    // Grounding with Google Search を有効化
    const model = genAI.getGenerativeModel(
      { model: "gemini-2.0-flash" },
      { apiVersion: "v1beta" }
    );

    const requestBody: GenerateContentRequest = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `「${query}」のレシピをWeb上で検索して、一人暮らし向けの簡単なレシピを3〜5件紹介してください。
各レシピについて以下の情報を含めてください：
- レシピ名
- 簡単な説明（1〜2行）
- 参考サイト名とURL
- 調理時間（わかる場合）
- カテゴリ（包丁不要, レンジのみ, フライパン1つ, 鍋1つ, 混ぜるだけ のいずれか）

必ず以下のJSON配列形式のみで返答してください（他のテキスト不要）:
[
  {
    "title": "レシピ名",
    "description": "説明",
    "sourceUrl": "https://...",
    "sourceName": "サイト名",
    "prep_time": 分数または null,
    "category": "カテゴリ名またはnull"
  }
]`,
            },
          ],
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tools: [{ googleSearch: {} }] as any,
    };

    const result = await model.generateContent(requestBody);
    const text = result.response.text();

    // JSON 配列を抽出
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json({ recipes: [] });
    }

    const recipes = JSON.parse(jsonMatch[0]) as WebSearchRecipe[];

    return NextResponse.json({ recipes });
  } catch (err) {
    console.error("[search-recipes]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "検索に失敗しました" },
      { status: 500 }
    );
  }
}
