import { ShimmerSkeleton } from "@/components/shared/ShimmerSkeleton";

export default function ProfileLoading() {
  return (
    <div className="px-4 pt-6 flex flex-col gap-4">
      <ShimmerSkeleton className="h-8 w-32" />
      {/* ユーザーカード */}
      <div className="bg-white rounded-2xl p-6 flex flex-col items-center gap-4">
        <ShimmerSkeleton className="w-20 h-20 rounded-full" />
        <ShimmerSkeleton className="h-5 w-28" />
        <ShimmerSkeleton className="h-4 w-40" />
        <ShimmerSkeleton className="h-8 w-16 rounded-full" />
        <ShimmerSkeleton className="h-3 w-full rounded-full" />
      </div>
      {/* 統計カード */}
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <ShimmerSkeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      {/* 履歴 */}
      <ShimmerSkeleton className="h-5 w-24" />
      {Array.from({ length: 5 }).map((_, i) => (
        <ShimmerSkeleton key={i} className="h-14 w-full rounded-2xl" />
      ))}
    </div>
  );
}
