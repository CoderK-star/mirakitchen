"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, Clock, ExternalLink, Download } from "lucide-react";
import { toast } from "sonner";
import { saveAiRecipe } from "@/app/actions/save-ai-recipe";
import type { WebSearchRecipe, AiRecipeDraft } from "@/types";

export function WebSearchForm() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<WebSearchRecipe[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) {
      toast.error("検索ワードを入力してください");
      return;
    }
    setLoading(true);
    setResults([]);
    try {
      const res = await fetch("/api/ai/search-recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "検索に失敗しました");
      setResults(data.recipes as WebSearchRecipe[]);
      if (data.recipes.length === 0) {
        toast.info("検索結果が見つかりませんでした。別のワードを試してみてください。");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "検索に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  function handleImport(recipe: WebSearchRecipe) {
    // WebSearchRecipe → AiRecipeDraft に変換して保存
    const draft: AiRecipeDraft = {
      title: recipe.title,
      description: recipe.description,
      difficulty_level: 1,
      prep_time: recipe.prep_time ?? 15,
      category: recipe.category ?? "フライパン1つ",
      required_level: 1,
      xp_reward: 50,
      steps: [
        {
          step_number: 1,
          instruction: `${recipe.sourceName} のレシピを参照してください: ${recipe.sourceUrl}`,
          tip: "詳しい手順は元サイトをご確認ください",
        },
      ],
    };

    setSavingId(recipe.sourceUrl);
    startTransition(async () => {
      const result = await saveAiRecipe({ draft });
      setSavingId(null);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("レシピを保存しました！");
        window.location.href = `/recipes/${result.recipeId}`;
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSearch} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">レシピを検索</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="例: チキンソテー、トマトパスタ…"
              className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/40 transition"
            />
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.95 }}
              className="rounded-xl bg-[#FF8C00] px-4 py-3 text-white disabled:opacity-60"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            </motion.button>
          </div>
        </div>
      </form>

      {/* スケルトン */}
      {loading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="shimmer h-24 rounded-2xl" />
          ))}
        </div>
      )}

      {/* 検索結果 */}
      {!loading && results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3"
        >
          <p className="text-xs text-gray-500">{results.length}件のレシピが見つかりました</p>
          {results.map((recipe) => (
            <div
              key={recipe.sourceUrl}
              className="rounded-2xl bg-white shadow-sm overflow-hidden p-4 flex flex-col gap-2"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-gray-900 text-sm leading-snug">{recipe.title}</h3>
                {recipe.prep_time && (
                  <span className="flex items-center gap-0.5 text-[10px] text-gray-400 shrink-0">
                    <Clock size={11} />
                    {recipe.prep_time}分
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-500 leading-relaxed">{recipe.description}</p>

              <div className="flex items-center gap-2">
                {recipe.category && (
                  <span className="text-[10px] bg-gray-100 rounded-full px-2 py-0.5">
                    {recipe.category}
                  </span>
                )}
                <a
                  href={recipe.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-0.5 text-[10px] text-[#FF8C00] ml-auto"
                >
                  <ExternalLink size={11} />
                  {recipe.sourceName}
                </a>
              </div>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => handleImport(recipe)}
                disabled={savingId === recipe.sourceUrl}
                className="flex items-center justify-center gap-2 mt-1 rounded-xl border border-[#FF8C00] text-[#FF8C00] py-2 text-xs font-semibold disabled:opacity-60"
              >
                {savingId === recipe.sourceUrl ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <>
                    <Download size={13} />
                    アプリに取り込む
                  </>
                )}
              </motion.button>
            </div>
          ))}
        </motion.div>
      )}

      {/* ヒント */}
      {!loading && results.length === 0 && (
        <div className="flex items-start gap-3 rounded-xl bg-blue-50 p-4">
          <Search size={20} className="text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs text-gray-600 leading-relaxed">
            Google検索を使って、Web上のレシピサイトからレシピを探します。
            気に入ったレシピは「取り込む」でアプリに保存できます。
          </p>
        </div>
      )}
    </div>
  );
}
