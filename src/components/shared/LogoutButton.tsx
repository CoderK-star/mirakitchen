"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { haptics } from "@/lib/haptics";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    haptics.medium();
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("ログアウトに失敗しました");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="min-h-[44px] w-full rounded-2xl border border-gray-200 bg-white text-gray-600 font-medium text-sm active:scale-95 transition"
    >
      ログアウト
    </button>
  );
}
