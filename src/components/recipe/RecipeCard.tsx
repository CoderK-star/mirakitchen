"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { LevelBadge } from "@/components/shared/LevelBadge";
import type { RecipeCardData } from "@/types";

interface RecipeCardProps {
  recipe: RecipeCardData;
  userLevel: number;
  /** Stagger アニメーション用のインデックス (省略可) */
  index?: number;
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const, delay: i * 0.07 },
  }),
};

/**
 * レシピカード (DESIGN.md §5.3)
 * - レベル未達時はロックオーバーレイ表示
 * - Framer Motion の spring でホバー/タップ
 */
export function RecipeCard({ recipe, userLevel, index = 0 }: RecipeCardProps) {
  const isLocked = recipe.required_level > userLevel;

  function handleLockedTap() {
    toast.info(`Lv.${recipe.required_level} で解放されます 🔒`);
  }

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="rounded-2xl overflow-hidden bg-white shadow-sm relative"
    >
      {/* サムネイル */}
      <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
        {recipe.image_url ? (
          <Image
            src={recipe.image_url}
            alt={recipe.title}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            🍳
          </div>
        )}

        {/* ロックオーバーレイ (DESIGN.md §5.3) */}
        {isLocked && (
          <div className="absolute inset-0 bg-gray-900/40 flex flex-col items-center justify-center gap-1">
            <Lock size={28} className="text-white" />
            <span className="text-white text-xs font-bold">
              Lv.{recipe.required_level} で解放
            </span>
          </div>
        )}
      </div>

      {/* 本文 */}
      <div className="p-3 flex flex-col gap-1.5">
        <p
          className={cn(
            "text-sm font-bold leading-tight line-clamp-2",
            isLocked ? "text-gray-400" : "text-gray-800"
          )}
        >
          {recipe.title}
        </p>
        <div className="flex items-center gap-2">
          <LevelBadge level={recipe.required_level} size="sm" />
          <span className="flex items-center gap-0.5 text-xs text-gray-500">
            <Clock size={12} />
            {recipe.prep_time}分
          </span>
          <span className="text-xs font-bold text-[#A7C957] ml-auto">
            +{recipe.xp_reward} XP
          </span>
        </div>
      </div>

      {/* タップ領域 */}
      {isLocked ? (
        <button
          onClick={handleLockedTap}
          className="absolute inset-0 w-full h-full min-h-[44px] min-w-[44px]"
          aria-label={`${recipe.title} - Lv.${recipe.required_level} で解放`}
        />
      ) : (
        <Link
          href={`/recipes/${recipe.id}`}
          className="absolute inset-0 min-h-[44px] min-w-[44px]"
          aria-label={`${recipe.title}の詳細を見る`}
        />
      )}
    </motion.div>
  );
}
