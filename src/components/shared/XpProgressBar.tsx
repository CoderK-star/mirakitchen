"use client";

import { cn } from "@/lib/utils";

interface XpProgressBarProps {
  currentXp: number;
  nextLevelXp: number;
  className?: string;
}

/**
 * XP プログレスバー (DESIGN.md §5.2)
 * グラデーション + 600ms ease-out トランジション
 */
export function XpProgressBar({
  currentXp,
  nextLevelXp,
  className,
}: XpProgressBarProps) {
  const percent = Math.min(100, Math.round((currentXp / nextLevelXp) * 100));

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="h-3 w-full rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${percent}%`,
            background: "linear-gradient(to right, #FB923C, #FDE047)",
            transition: "width 600ms ease-out",
          }}
        />
      </div>
      <p className="text-xs text-gray-500 text-right">
        {currentXp} / {nextLevelXp} XP
      </p>
    </div>
  );
}
