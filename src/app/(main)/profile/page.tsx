import { redirect } from "next/navigation";
import { Star, Flame, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { calcLevelInfo } from "@/lib/level";
import { LevelBadge } from "@/components/shared/LevelBadge";
import { XpProgressBar } from "@/components/shared/XpProgressBar";
import { LogoutButton } from "@/components/shared/LogoutButton";

interface HistoryRow {
  id: string;
  completed_at: string;
  xp_gained: number;
  recipes: {
    title: string;
    prep_time: number;
    required_level: number;
  } | null;
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: history }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("user_history")
      .select("id, completed_at, xp_gained, recipes(title, prep_time, required_level)")
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false })
      .limit(20)
      .returns<HistoryRow[]>(),
  ]);

  const levelInfo = calcLevelInfo(profile?.total_xp ?? 0);
  const totalCooked = history?.length ?? 0;
  const totalXpFromHistory =
    history?.reduce((sum, h) => sum + h.xp_gained, 0) ?? 0;

  return (
    <div className="px-4 pt-6 pb-4 flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-gray-800">プロフィール</h1>

      {/* ユーザーカード */}
      <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-[#FFF0D9] flex items-center justify-center text-4xl">
          🧑‍🍳
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-gray-800">
            {profile?.username ?? "シェフ"}
          </p>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
        <LevelBadge level={levelInfo.level} size="lg" />
        <div className="w-full">
          <XpProgressBar
            currentXp={levelInfo.currentXp}
            nextLevelXp={levelInfo.nextLevelXp}
          />
        </div>
        <p className="text-xs text-gray-500">
          累計 XP:{" "}
          <span className="font-bold text-[#FF8C00]">
            {profile?.total_xp ?? 0}
          </span>
        </p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          emoji={<Flame size={20} className="text-[#FF8C00]" />}
          value={levelInfo.level}
          label="レベル"
        />
        <StatCard
          emoji={<Star size={20} className="text-yellow-400" />}
          value={totalXpFromHistory}
          label="獲得XP"
        />
        <StatCard
          emoji={<span className="text-xl">🍳</span>}
          value={totalCooked}
          label="調理回数"
        />
      </div>

      {/* 調理履歴 */}
      <div>
        <h2 className="text-base font-bold text-gray-800 mb-3">調理履歴</h2>
        {!history || history.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10">
            <span className="text-4xl">🍽️</span>
            <p className="text-sm text-gray-400">まだ調理記録がありません</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {history.map((h) => (
              <li
                key={h.id}
                className="bg-white rounded-2xl shadow-sm px-4 py-3 flex items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">
                    {h.recipes?.title ?? "レシピ"}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {h.recipes?.prep_time && (
                      <span className="flex items-center gap-0.5 text-xs text-gray-400">
                        <Clock size={10} />
                        {h.recipes.prep_time}分
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {formatDate(h.completed_at)}
                    </span>
                  </div>
                </div>
                <span className="shrink-0 text-sm font-bold text-[#A7C957]">
                  +{h.xp_gained} XP
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <LogoutButton />
    </div>
  );
}

function StatCard({
  emoji,
  value,
  label,
}: {
  emoji: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-3 flex flex-col items-center gap-1.5">
      {emoji}
      <p
        className="text-2xl font-black text-gray-800"
        style={{ fontFamily: "var(--font-nunito)" }}
      >
        {value}
      </p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "今日";
  if (diffDays === 1) return "昨日";
  if (diffDays < 7) return `${diffDays}日前`;
  return `${d.getMonth() + 1}/${d.getDate()}`;
}
