"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ChevronDown, ChevronUp, Sparkles, Save, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { LevelBadge } from "@/components/shared/LevelBadge";
import { saveAiRecipe } from "@/app/actions/save-ai-recipe";
import type { AiRecipeDraft } from "@/types";

interface AiRecipePreviewProps {
  draft: AiRecipeDraft;
}

export function AiRecipePreview({ draft: initialDraft }: AiRecipePreviewProps) {
  const [draft, setDraft] = useState(initialDraft);
  const [showSteps, setShowSteps] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleGenerateImage() {
    setGeneratingImage(true);
    try {
      const res = await fetch("/api/ai/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipeTitle: draft.title,
          description: draft.description,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "画像生成に失敗しました");
      setDraft((prev) => ({ ...prev, generatedImageUrl: data.imageUrl }));
      toast.success("画像を生成しました ✨");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "画像生成に失敗しました");
    } finally {
      setGeneratingImage(false);
    }
  }

  function handleSave() {
    startTransition(async () => {
      const result = await saveAiRecipe({
        draft,
        imageUrl: draft.generatedImageUrl ?? undefined,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("レシピを保存しました！");
        // レシピ詳細ページへ遷移（router.push は使えないので window.location）
        window.location.href = `/recipes/${result.recipeId}`;
      }
    });
  }

  const imageUrl = draft.generatedImageUrl;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl overflow-hidden bg-white shadow-sm"
    >
      {/* サムネイル */}
      <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={draft.title}
            fill
            sizes="(max-width: 768px) 100vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <span className="text-5xl">🍳</span>
            <button
              onClick={handleGenerateImage}
              disabled={generatingImage}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#FF8C00] bg-white rounded-full px-4 py-1.5 shadow-sm border border-[#FF8C00]/20 transition hover:bg-orange-50 disabled:opacity-60"
            >
              {generatingImage ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  画像生成中…
                </>
              ) : (
                <>
                  <Sparkles size={13} />
                  AI画像を生成する
                </>
              )}
            </button>
          </div>
        )}

        {/* AI バッジ */}
        <div className="absolute top-2 left-2">
          <span className="flex items-center gap-1 text-[10px] font-bold bg-[#FF8C00] text-white rounded-full px-2 py-0.5">
            <Sparkles size={10} />
            AI生成
          </span>
        </div>
      </div>

      {/* 本文 */}
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-gray-900 text-base leading-snug">{draft.title}</h3>
          <LevelBadge level={draft.required_level} size="sm" />
        </div>

        {draft.description && (
          <p className="text-xs text-gray-500 leading-relaxed">{draft.description}</p>
        )}

        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {draft.prep_time}分
          </span>
          <span className="bg-gray-100 rounded-full px-2 py-0.5">{draft.category}</span>
          <span className="text-[#FF8C00] font-bold">+{draft.xp_reward} XP</span>
        </div>

        {/* ステップ展開 */}
        <button
          onClick={() => setShowSteps((v) => !v)}
          className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 py-2 border-t border-gray-100"
        >
          <span>手順（{draft.steps.length}ステップ）</span>
          {showSteps ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        <AnimatePresence>
          {showSteps && (
            <motion.ol
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col gap-3 overflow-hidden"
            >
              {draft.steps.map((step) => (
                <li key={step.step_number} className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-[#FF8C00] text-white text-xs font-bold flex items-center justify-center">
                    {step.step_number}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800 leading-relaxed">{step.instruction}</p>
                    {step.tip && (
                      <p className="mt-1 text-xs text-[#A7C957] bg-green-50 rounded-lg px-2 py-1">
                        💡 {step.tip}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </motion.ol>
          )}
        </AnimatePresence>

        {/* アクションボタン */}
        <div className="flex gap-2 pt-1">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleSave}
            disabled={isPending}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#FF8C00] py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <Save size={16} />
                レシピを保存する
              </>
            )}
          </motion.button>
          {imageUrl && (
            <button
              onClick={handleGenerateImage}
              disabled={generatingImage}
              className="flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-3 text-xs text-gray-500 disabled:opacity-60"
              title="画像を再生成"
            >
              {generatingImage ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <ExternalLink size={14} />
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
