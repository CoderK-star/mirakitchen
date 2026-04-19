import { RecipeCardSkeletons } from "@/components/shared/ShimmerSkeleton";

export default function RecipesLoading() {
  return (
    <div className="pt-6">
      <div className="px-4 mb-4">
        <div className="shimmer h-7 w-24 rounded-lg mb-1" />
        <div className="shimmer h-4 w-36 rounded-lg" />
      </div>
      <div className="px-4 mb-3 flex gap-2">
        <div className="shimmer h-8 w-16 rounded-full" />
        <div className="shimmer h-8 w-28 rounded-full" />
      </div>
      <div className="px-4 mb-4 flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="shimmer h-7 w-20 rounded-full shrink-0" />
        ))}
      </div>
      <RecipeCardSkeletons />
    </div>
  );
}
