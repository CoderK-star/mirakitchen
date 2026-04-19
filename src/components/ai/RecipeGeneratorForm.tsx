"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ChefHat, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { AiRecipeDraft, RecipeCategory } from "@/types";
import { AiRecipePreview } from "./AiRecipePreview";

const CATEGORIES: RecipeCategory[] = [
  "包丁不要",
  "レンジのみ",
  "フライパン1つ",
  "鍋1つ",
  "混ぜるだけ",
];

interface RecipeGeneratorFormProps {
  userLevel: number;
}

export function RecipeGeneratorForm({ userLevel }: RecipeGeneratorFormProps) {
  const [preferences, setPreferences] = useState("");
  const [category, setCategory] = useState<RecipeCategory | "">("");
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<AiRecipeDraft | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!preferences.trim()) {
      toast.error("どんな料理が食べたいか入力してください");
      return;
    }
    setLoading(true);
    setDraft(null);
    try {
      const res = await fetch("/api/ai/generate-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferences,
          level: userLevel,
          category: category || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "生成に失敗しました");
      setDraft(data.draft as AiRecipeDraft);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "生成に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* フリーテキスト */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">
            どんな料理が食べたい？
          </label>
          <textarea
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            placeholder="例: 簡単に作れる卵料理、体が温まるもの、10分以内で作れるもの…"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/40 transition"
            rows={3}
          />
        </div>

        {/* カテゴリ選択 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">
            カテゴリ（任意）
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(category === cat ? "" : cat)}
                className={cn(
                  "text-xs font-medium px-3 py-1.5 rounded-full border transition",
                  category === cat
                    ? "bg-[#FF8C00] text-white border-[#FF8C00]"
                    : "bg-white text-gray-600 border-gray-200"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          whileTap={{ scale: 0.97 }}
          className={cn(
            "flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white transition",
            loading ? "bg-gray-300" : "bg-[#FF8C00]"
          )}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              AIが考え中…
            </>
          ) : (
            <>
              <Sparkles size={18} />
              レシピを生成する
            </>
          )}
        </motion.button>
      </form>

      {/* スケルトン */}
      {loading && (
        <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
          <div className="shimmer aspect-[4/3] rounded-none" />
          <div className="p-4 flex flex-col gap-2">
            <div className="shimmer h-5 w-2/3 rounded-lg" />
            <div className="shimmer h-3 w-full rounded-lg" />
            <div className="shimmer h-3 w-4/5 rounded-lg" />
          </div>
        </div>
      )}

      {/* 生成結果 */}
      {!loading && draft && <AiRecipePreview draft={draft} />}

      {/* 使い方ヒント */}
      {!loading && !draft && (
        <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-4">
          <ChefHat size={20} className="text-[#FF8C00] shrink-0 mt-0.5" />
          <p className="text-xs text-gray-600 leading-relaxed">
            あなたのレベル（Lv.{userLevel}）に合ったレシピをAIが考えます。
            食べたいものや作りやすい条件を入力してみてください。
          </p>
        </div>
      )}
    </div>
  );
}
