"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Ingredient, IngredientCategory } from "@/lib/ingredients";
import { INGREDIENT_CATEGORIES } from "@/lib/ingredients";

interface IngredientListProps {
  ingredients: Ingredient[];
}

const categoryEmoji: Record<IngredientCategory, string> = {
  "野菜": "🥦",
  "肉・魚": "🥩",
  "卵・乳製品": "🥚",
  "乾物・調味料": "🍶",
  "きのこ・海藻": "🍄",
};

export function IngredientList({ ingredients }: IngredientListProps) {
  const [activeCategory, setActiveCategory] = useState<IngredientCategory | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = activeCategory
    ? ingredients.filter((i) => i.category === activeCategory)
    : ingredients;

  return (
    <div className="flex flex-col gap-4">
      {/* カテゴリフィルター */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveCategory(null)}
          className={cn(
            "shrink-0 rounded-full px-3 py-1 text-xs font-medium border transition-colors min-h-[44px]",
            activeCategory === null
              ? "bg-[#FF8C00] text-white border-[#FF8C00]"
              : "bg-white text-gray-600 border-gray-200"
          )}
        >
          すべて
        </button>
        {INGREDIENT_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-xs font-medium border transition-colors min-h-[44px]",
              activeCategory === cat
                ? "bg-[#FF8C00] text-white border-[#FF8C00]"
                : "bg-white text-gray-600 border-gray-200"
            )}
          >
            {categoryEmoji[cat]} {cat}
          </button>
        ))}
      </div>

      {/* 食材リスト */}
      <ul className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {filtered.map((ingredient) => {
            const key = ingredient.name;
            const isOpen = expandedId === key;
            return (
              <motion.li
                key={key}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                className="bg-white rounded-2xl shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setExpandedId(isOpen ? null : key)}
                  className="w-full flex items-center gap-3 px-4 py-3 min-h-[56px]"
                  aria-expanded={isOpen}
                >
                  <span className="text-2xl shrink-0">{ingredient.emoji}</span>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-bold text-gray-800">
                      {ingredient.name}
                    </p>
                    <p className="text-xs text-gray-400">{ingredient.category}</p>
                  </div>
                  {isOpen ? (
                    <ChevronUp size={16} className="text-gray-400 shrink-0" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-400 shrink-0" />
                  )}
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{
                        height: "auto",
                        opacity: 1,
                        transition: { type: "spring", stiffness: 300, damping: 28 },
                      }}
                      exit={{ height: 0, opacity: 0, transition: { duration: 0.2 } }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 flex flex-col gap-2 border-t border-gray-50 pt-3">
                        <InfoRow label="保存方法" value={ingredient.storage} />
                        <InfoRow label="保存期間" value={ingredient.shelfLife} />
                        <div className="bg-orange-50 rounded-xl px-3 py-2 mt-1">
                          <p className="text-xs text-[#FF8C00] leading-relaxed">
                            💡 {ingredient.tips}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <p className="text-xs font-bold text-gray-400 w-16 shrink-0 mt-0.5">{label}</p>
      <p className="text-xs text-gray-600 leading-relaxed flex-1">{value}</p>
    </div>
  );
}
