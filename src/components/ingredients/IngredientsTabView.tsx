"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { INGREDIENTS } from "@/lib/ingredients";
import { IngredientList } from "./IngredientList";
import { CookingTermsList } from "./CookingTermsList";
import { StarterKitList } from "./StarterKitList";

type Tab = "ingredients" | "terms" | "starter";

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: "ingredients", label: "食材辞書", emoji: "🥦" },
  { id: "terms", label: "用語辞書", emoji: "📖" },
  { id: "starter", label: "スターターキット", emoji: "🎒" },
];

export function IngredientsTabView() {
  const [activeTab, setActiveTab] = useState<Tab>("ingredients");

  return (
    <div className="flex flex-col gap-4">
      {/* タブバー */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors min-h-[44px] whitespace-nowrap",
              activeTab === tab.id
                ? "bg-[#FF8C00] text-white border-[#FF8C00]"
                : "bg-white text-gray-600 border-gray-200"
            )}
          >
            {tab.emoji} {tab.label}
          </button>
        ))}
      </div>

      {/* コンテンツ */}
      {activeTab === "ingredients" && <IngredientList ingredients={INGREDIENTS} />}
      {activeTab === "terms" && <CookingTermsList />}
      {activeTab === "starter" && <StarterKitList />}
    </div>
  );
}
