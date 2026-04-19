import { cn } from "@/lib/utils";

interface ShimmerSkeletonProps {
  className?: string;
}

/**
 * シマースケルトン (DESIGN.md §5.9)
 * animate-pulse の代わりに .shimmer クラスを使用
 */
export function ShimmerSkeleton({ className }: ShimmerSkeletonProps) {
  return <div className={cn("shimmer rounded-lg", className)} />;
}

/**
 * レシピカード用スケルトン × 4枚
 */
export function RecipeCardSkeletons() {
  return (
    <div className="grid grid-cols-2 gap-3 p-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl overflow-hidden bg-white shadow-sm">
          <ShimmerSkeleton className="aspect-[4/3] rounded-none" />
          <div className="p-3 flex flex-col gap-2">
            <ShimmerSkeleton className="h-4 w-3/4" />
            <ShimmerSkeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
