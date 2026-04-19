import { cn } from "@/lib/utils";

type LevelBadgeSize = "sm" | "md" | "lg";

interface LevelBadgeProps {
  level: number;
  size?: LevelBadgeSize;
  className?: string;
}

const sizeClasses: Record<LevelBadgeSize, string> = {
  sm: "h-5 px-2 text-xs",
  md: "h-7 px-3 text-sm",
  lg: "h-10 px-4 text-base",
};

/**
 * レベルバッジ (DESIGN.md §5.1)
 * Mira Orange 背景, Nunito Bold, "Lv.3" 形式
 */
export function LevelBadge({ level, size = "md", className }: LevelBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-[#FF8C00] text-white font-bold font-[var(--font-nunito)] select-none",
        sizeClasses[size],
        className
      )}
    >
      Lv.{level}
    </span>
  );
}
