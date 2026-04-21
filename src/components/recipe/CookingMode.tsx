"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { haptics } from "@/lib/haptics";
import { completeRecipe } from "@/app/actions/complete-recipe";
import type { RecipeWithSteps } from "@/types";
import { detectTerms, type CookingTerm } from "@/lib/cooking-terms";

interface CookingModeProps {
  recipe: RecipeWithSteps;
}

type Phase = "cooking" | "completing" | "xp" | "levelup";

/** 調理用語を1件展開表示するカード */
function TermCard({ term }: { term: CookingTerm }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-purple-50 border border-purple-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left min-h-[40px]"
      >
        <span className="text-base shrink-0">{term.emoji}</span>
        <span className="flex-1 text-xs font-semibold text-purple-700">
          「{term.term}」ってどのくらい？
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-purple-400 shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 flex flex-col gap-1.5">
              <p className="text-sm font-semibold text-gray-800">{term.plain}</p>
              <p className="text-xs text-gray-600 leading-relaxed">{term.detail}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const stepVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.3, ease: "easeOut" as const } },
  exit: (dir: number) => ({
    x: dir > 0 ? "-100%" : "100%",
    opacity: 0,
    transition: { duration: 0.2 },
  }),
};

/**
 * 調理モード (DESIGN.md §5.4)
 * - 1画面1ステップ、スワイプ or ボタンで進む
 * - 完了 → XP 獲得演出 → レベルアップ演出
 */
export function CookingMode({ recipe }: CookingModeProps) {
  const router = useRouter();
  const steps = recipe.recipe_steps;
  const totalSteps = steps.length;

  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [phase, setPhase] = useState<Phase>("cooking");
  const [xpResult, setXpResult] = useState<{
    xpGained: number;
    newTotalXp: number;
    newLevel: number;
    leveledUp: boolean;
  } | null>(null);

  const currentStep = steps[stepIndex];

  const goNext = useCallback(() => {
    haptics.medium();
    if (stepIndex < totalSteps - 1) {
      setDirection(1);
      setStepIndex((i) => i + 1);
    }
  }, [stepIndex, totalSteps]);

  const goPrev = useCallback(() => {
    if (stepIndex > 0) {
      haptics.light();
      setDirection(-1);
      setStepIndex((i) => i - 1);
    }
  }, [stepIndex]);

  async function handleComplete() {
    haptics.success();
    setPhase("completing");

    const result = await completeRecipe(recipe.id);

    if (!result.success) {
      toast.error(result.error ?? "エラーが発生しました");
      setPhase("cooking");
      return;
    }

    setXpResult({
      xpGained: result.xpGained,
      newTotalXp: result.newTotalXp,
      newLevel: result.newLevel,
      leveledUp: result.leveledUp,
    });

    if (result.leveledUp) {
      setPhase("levelup");
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.5 },
          colors: ["#FF8C00", "#FFD700", "#A7C957", "#FF6B35"],
        });
      }, 400);
      setTimeout(() => {
        haptics.success();
      }, 500);
    } else {
      setPhase("xp");
    }
  }

  function handleFinish() {
    router.push("/home");
  }

  const isLastStep = stepIndex === totalSteps - 1;

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col overflow-hidden">
      {/* ステップインジケーター */}
      <div className="flex items-center justify-center gap-1.5 pt-safe pt-4 px-6 shrink-0">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === stepIndex
                ? "w-6 bg-[#FF8C00]"
                : i < stepIndex
                ? "w-2 bg-[#FF8C00]/40"
                : "w-2 bg-gray-200"
            }`}
          />
        ))}
      </div>
      <p className="text-center text-xs text-gray-400 mt-1.5 shrink-0">
        {stepIndex + 1} / {totalSteps}
      </p>

      {/* ステップコンテンツ */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={stepIndex}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) goNext();
              else if (info.offset.x > 60) goPrev();
            }}
            className="absolute inset-0 flex flex-col px-4 pt-4"
          >
            {/* 画像 */}
            {currentStep.image_url && (
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-4 shrink-0">
                <Image
                  src={currentStep.image_url}
                  alt={`ステップ ${currentStep.step_number}`}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* 指示テキスト */}
            <p className="text-3xl font-bold text-gray-800 leading-snug">
              {currentStep.instruction}
            </p>

            {/* Tips */}
            {currentStep.tip && (
              <div className="mt-4 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3">
                <p className="text-sm text-[#FF8C00] font-medium leading-relaxed">
                  💡 {currentStep.tip}
                </p>
              </div>
            )}

            {/* 用語解説カード — tip と instruction 内の調理用語を自動検出 */}
            {(() => {
              const text = `${currentStep.instruction} ${currentStep.tip ?? ""}`;
              const terms = detectTerms(text);
              if (terms.length === 0) return null;
              return (
                <div className="mt-3 flex flex-col gap-2">
                  {terms.map((term) => (
                    <TermCard key={term.term} term={term} />
                  ))}
                </div>
              );
            })()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ボトムボタン */}
      <div className="px-4 pb-safe pb-8 pt-4 shrink-0">
        {isLastStep ? (
          <motion.button
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={handleComplete}
            disabled={phase === "completing"}
            className="w-full h-16 rounded-2xl bg-[#A7C957] text-white font-bold text-base shadow-md flex items-center justify-center gap-2 disabled:opacity-70 min-h-[44px]"
          >
            {phase === "completing" ? (
              <>
                <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                記録中…
              </>
            ) : (
              "🎉 完成！XP をもらう"
            )}
          </motion.button>
        ) : (
          <motion.button
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={goNext}
            className="w-full h-16 rounded-2xl bg-[#FF8C00] text-white font-bold text-base shadow-md flex items-center justify-center gap-2 min-h-[44px]"
          >
            次へ
            <ChevronRight size={20} />
          </motion.button>
        )}
      </div>

      {/* XP 獲得オーバーレイ */}
      <AnimatePresence>
        {phase === "xp" && xpResult && (
          <XpOverlay
            xpGained={xpResult.xpGained}
            newLevel={xpResult.newLevel}
            onClose={handleFinish}
          />
        )}
      </AnimatePresence>

      {/* レベルアップオーバーレイ */}
      <AnimatePresence>
        {phase === "levelup" && xpResult && (
          <LevelUpOverlay
            newLevel={xpResult.newLevel}
            xpGained={xpResult.xpGained}
            onClose={handleFinish}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── XP 獲得演出 ──────────────────────── */

function XpOverlay({
  xpGained,
  newLevel,
  onClose,
}: {
  xpGained: number;
  newLevel: number;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/50 flex items-end"
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0, transition: { type: "spring", stiffness: 300, damping: 28 } }}
        exit={{ y: "100%" }}
        className="w-full bg-white rounded-t-3xl px-6 pt-6 pb-safe pb-10 flex flex-col items-center gap-4"
      >
        <span className="text-5xl">🎉</span>
        <h2 className="text-2xl font-black text-gray-800">料理完了！</h2>
        <div className="bg-orange-50 rounded-2xl px-8 py-4 text-center">
          <p className="text-sm text-gray-500 mb-1">獲得 XP</p>
          <p
            className="text-4xl font-black text-[#FF8C00]"
            style={{ fontFamily: "var(--font-nunito)" }}
          >
            +{xpGained}
          </p>
        </div>
        <p className="text-sm text-gray-500">
          現在のレベル:{" "}
          <span className="font-bold text-[#FF8C00]">Lv.{newLevel}</span>
        </p>
        <button
          onClick={onClose}
          className="w-full h-14 rounded-2xl bg-[#FF8C00] text-white font-bold text-base min-h-[44px]"
        >
          ホームへ戻る
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ── レベルアップ演出 ──────────────────── */

function LevelUpOverlay({
  newLevel,
  xpGained,
  onClose,
}: {
  newLevel: number;
  xpGained: number;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 mesh-gradient-levelup flex flex-col items-center justify-center px-6 gap-6"
    >
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
        className="text-white/80 text-lg font-bold tracking-widest"
      >
        LEVEL UP!
      </motion.p>

      <motion.p
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{
          scale: 1,
          opacity: 1,
          transition: { type: "spring", stiffness: 200, damping: 12, delay: 0.3 },
        }}
        className="text-white font-black leading-none"
        style={{ fontSize: "7rem", fontFamily: "var(--font-nunito)" }}
      >
        {newLevel}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.7 } }}
        className="flex flex-col items-center gap-1"
      >
        <p className="text-white/90 text-base font-bold">
          +{xpGained} XP 獲得！
        </p>
        <p className="text-white/70 text-sm">新しいレベルに到達しました 🚀</p>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 1.0 } }}
        whileTap={{ scale: 0.97 }}
        onClick={onClose}
        className="w-full h-14 rounded-2xl bg-white text-[#FF8C00] font-bold text-base min-h-[44px] shadow-lg"
      >
        続ける
      </motion.button>
    </motion.div>
  );
}
