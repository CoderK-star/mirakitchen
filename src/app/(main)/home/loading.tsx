import { RecipeCardSkeletons } from "@/components/shared/ShimmerSkeleton";

export default function HomeLoading() {
  return (
    <div className="px-4 pt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col gap-1">
          <div className="shimmer h-3 w-16 rounded" />
          <div className="shimmer h-5 w-28 rounded" />
        </div>
        <div className="shimmer h-10 w-14 rounded-full" />
      </div>
      <RecipeCardSkeletons />
    </div>
  );
}
