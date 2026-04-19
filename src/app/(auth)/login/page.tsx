"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { haptics } from "@/lib/haptics";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    haptics.light();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      haptics.error();
      toast.error("ログインに失敗しました", { description: error.message });
      setLoading(false);
      return;
    }

    haptics.success();
    router.push("/home");
    router.refresh();
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 flex flex-col gap-6">
      {/* ロゴ */}
      <div className="text-center">
        <h1
          className="text-3xl font-black text-[#FF8C00]"
          style={{ fontFamily: "var(--font-nunito)" }}
        >
          🍳 Mirakitchen
        </h1>
        <p className="text-sm text-gray-500 mt-1">自炊のパーソナルトレーナー</p>
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FF8C00]/40 focus:border-[#FF8C00] transition"
            placeholder="example@mail.com"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="password"
            className="text-sm font-medium text-gray-700"
          >
            パスワード
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FF8C00]/40 focus:border-[#FF8C00] transition"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 min-h-[44px] w-full rounded-xl bg-[#FF8C00] text-white font-bold text-sm py-3 disabled:opacity-60 transition active:scale-95"
        >
          {loading ? "ログイン中…" : "ログイン"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        アカウントをお持ちでない方は{" "}
        <Link href="/signup" className="text-[#FF8C00] font-medium">
          新規登録
        </Link>
      </p>
    </div>
  );
}
