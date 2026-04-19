import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AiChefTabs } from "@/components/ai/AiChefTabs";

export const metadata = { title: "AIシェフ – Mirakitchen" };

export default async function AiChefPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("level")
    .eq("id", user.id)
    .single();

  const userLevel = profile?.level ?? 1;

  return (
    <div className="px-4 pt-6 pb-4 flex flex-col gap-4">
      {/* ヘッダー */}
      <div className="mesh-gradient-hero rounded-2xl p-5 flex flex-col gap-1">
        <span className="text-[10px] font-bold text-[#FF8C00] bg-white/80 rounded-full px-2 py-0.5 w-fit">
          AI機能
        </span>
        <h1 className="text-xl font-extrabold text-gray-900">AI シェフ 🤖🍳</h1>
        <p className="text-xs text-gray-600">
          Gemini AIがレシピ提案・献立作成・Web検索をサポートします
        </p>
      </div>

      {/* タブ UI（Client Component） */}
      <AiChefTabs userLevel={userLevel} />
    </div>
  );
}
