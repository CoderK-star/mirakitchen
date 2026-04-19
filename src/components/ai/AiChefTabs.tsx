"use client";

import { useState } from "react";
import { Sparkles, Calendar, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { RecipeGeneratorForm } from "./RecipeGeneratorForm";
import { MealPlanForm } from "./MealPlanForm";
import { WebSearchForm } from "./WebSearchForm";

const TABS = [
  { id: "generate", label: "レシピ生成", icon: Sparkles },
  { id: "mealplan", label: "献立作成", icon: Calendar },
  { id: "search", label: "Web検索", icon: Search },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface AiChefTabsProps {
  userLevel: number;
}

export function AiChefTabs({ userLevel }: AiChefTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("generate");

  return (
    <div className="flex flex-col gap-4">
      {/* タブバー */}
      <div className="flex bg-gray-100 rounded-2xl p-1 gap-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex-1 flex flex-col items-center gap-0.5 rounded-xl py-2 text-[10px] font-bold transition",
              activeTab === id
                ? "bg-white text-[#FF8C00] shadow-sm"
                : "text-gray-500"
            )}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* タブコンテンツ */}
      {activeTab === "generate" && <RecipeGeneratorForm userLevel={userLevel} />}
      {activeTab === "mealplan" && <MealPlanForm userLevel={userLevel} />}
      {activeTab === "search" && <WebSearchForm />}
    </div>
  );
}
