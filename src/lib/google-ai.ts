/**
 * Google Generative AI クライアント初期化ユーティリティ
 */
import { GoogleGenerativeAI } from "@google/generative-ai";

let _genAI: GoogleGenerativeAI | null = null;

export function getGoogleAI(): GoogleGenerativeAI {
  if (!_genAI) {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GOOGLE_GENERATIVE_AI_API_KEY が設定されていません。" +
          ".env.local に追加してください。"
      );
    }
    _genAI = new GoogleGenerativeAI(apiKey);
  }
  return _genAI;
}

/**
 * Gemini 2.0 Flash モデルを取得（デフォルト）
 */
export function getGeminiModel(modelName = "gemini-2.0-flash") {
  return getGoogleAI().getGenerativeModel({ model: modelName });
}
