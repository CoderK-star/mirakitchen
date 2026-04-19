import { ShimmerSkeleton } from "@/components/shared/ShimmerSkeleton";

export default function RecipeDetailLoading() {
  return (
    <div className="pb-8">
      <ShimmerSkeleton className="w-full aspect-[4/3] rounded-none" />
      <div className="px-4 pt-4 flex flex-col gap-3">
        <ShimmerSkeleton className="h-5 w-3/4" />
        <ShimmerSkeleton className="h-4 w-full" />
        <ShimmerSkeleton className="h-4 w-2/3" />
        <ShimmerSkeleton className="h-6 w-20 rounded-full mt-1" />
        <div className="flex flex-col gap-2 mt-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <ShimmerSkeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
        <ShimmerSkeleton className="h-16 w-full rounded-2xl mt-4" />
      </div>
    </div>
  );
}
