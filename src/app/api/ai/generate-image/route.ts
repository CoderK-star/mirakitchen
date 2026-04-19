/**
 * POST /api/ai/generate-image
 * Imagen 3 でレシピの料理画像を生成し、Supabase Storage にキャッシュする
 * コスト対策: 同じ recipeTitle のハッシュでキャッシュチェック
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "recipe-images";

/** レシピ名から一意ファイル名を生成 */
function toFileName(title: string): string {
  const hash = Buffer.from(title).toString("base64url").slice(0, 32);
  return `${hash}.png`;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { recipeTitle, description } = (await req.json()) as {
    recipeTitle: string;
    description: string;
  };

  if (!recipeTitle?.trim()) {
    return NextResponse.json({ error: "recipeTitle は必須です" }, { status: 400 });
  }

  const fileName = toFileName(recipeTitle);

  // --- キャッシュチェック ---
  const { data: existing } = await supabase.storage
    .from(BUCKET)
    .getPublicUrl(fileName);

  if (existing?.publicUrl) {
    // Storage にファイルが存在するか HEAD で確認
    const headRes = await fetch(existing.publicUrl, { method: "HEAD" });
    if (headRes.ok) {
      return NextResponse.json({ imageUrl: existing.publicUrl, cached: true });
    }
  }

  // --- Imagen 3 で画像生成（Gemini API の imagegeneration エンドポイント） ---
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GOOGLE_GENERATIVE_AI_API_KEY が設定されていません" },
      { status: 500 }
    );
  }

  const imagePrompt =
    `A beautiful, appetizing food photo of "${recipeTitle}". ` +
    `${description ? description + ". " : ""}` +
    "Japanese home cooking style. Warm lighting, shallow depth of field, " +
    "plated on a simple white dish on a wooden table. No text or watermarks.";

  try {
    const imagenRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instances: [{ prompt: imagePrompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio: "1:1",
            safetyFilterLevel: "block_some",
            personGeneration: "dont_allow",
          },
        }),
      }
    );

    if (!imagenRes.ok) {
      const errText = await imagenRes.text();
      throw new Error(`Imagen API エラー: ${imagenRes.status} ${errText}`);
    }

    const imagenData = (await imagenRes.json()) as {
      predictions?: { bytesBase64Encoded: string }[];
    };

    const b64 = imagenData.predictions?.[0]?.bytesBase64Encoded;
    if (!b64) throw new Error("Imagen からの画像データが空でした");

    // Base64 → Buffer → Supabase Storage にアップロード
    const imageBuffer = Buffer.from(b64, "base64");
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, imageBuffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) throw new Error(`Storage アップロード失敗: ${uploadError.message}`);

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(fileName);

    return NextResponse.json({
      imageUrl: publicUrlData.publicUrl,
      cached: false,
    });
  } catch (err) {
    console.error("[generate-image]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "画像生成に失敗しました" },
      { status: 500 }
    );
  }
}
