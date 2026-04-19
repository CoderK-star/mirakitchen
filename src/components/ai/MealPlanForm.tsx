"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Calendar, Loader2, Save, Sparkles, Utensils } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { saveMealPlan } from "@/app/actions/save-meal-plan";
import type { AiMealPlanDraft } from "@/types";

const DAY_OPTIONS = [3, 5, 7] as const;
const MEAL_LABELS: Record<string, string> = {
  breakfast: "🌅 朝食",
  lunch: "☀️ 昼食",
  dinner: "🌙 夕食",
};
const DAY_NAMES = ["1日目", "2日目", "3日目", "4日目", "5日目", "6日目", "7日目"];

interface MealPlanFormProps {
  userLevel: number;
}

export function MealPlanForm({ userLevel }: MealPlanFormProps) {
  const [days, setDays] = useState<3 | 5 | 7>(3);
  const [preferences, setPreferences] = useState("");
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<AiMealPlanDraft | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setDraft(null);
    try {
      const res = await fetch("/api/ai/meal-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days, level: userLevel, preferences }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "生成に失敗しました");
      setDraft(data.draft as AiMealPlanDraft);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "生成に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  function handleSave() {
    if (!draft) return;
    startTransition(async () => {
      const result = await saveMealPlan(draft);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("献立を保存しました！");
        setDraft(null);
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleGenerate} className="flex flex-col gap-4">
        {/* 日数選択 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">日数</label>
          <div className="flex gap-2">
            {DAY_OPTIONS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDays(d)}
                className={cn(
                  "flex-1 rounded-xl border py-3 text-sm font-bold transition",
                  days === d
                    ? "bg-[#FF8C00] text-white border-[#FF8C00]"
                    : "bg-white text-gray-600 border-gray-200"
                )}
              >
                {d}日間
              </button>
            ))}
          </div>
        </div>

        {/* 好み・制約 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">好み・制約（任意）</label>
          <textarea
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            placeholder="例: 魚は苦手、節約重視、朝食は簡単にしたい…"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/40 transition"
            rows={2}
          />
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          whileTap={{ scale: 0.97 }}
          className={cn(
            "flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white transition",
            loading ? "bg-gray-300" : "bg-[#FF8C00]"
          )}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              献立を考え中…
            </>
          ) : (
            <>
              <Calendar size={18} />
              献立を生成する
            </>
          )}
        </motion.button>
      </form>

      {/* スケルトン */}
      {loading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="shimmer h-24 rounded-2xl" />
          ))}
        </div>
      )}

      {/* 生成結果 */}
      {!loading && draft && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3"
        >
          {/* タイトル */}
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#FF8C00]" />
            <h3 className="font-bold text-gray-800 text-sm">{draft.planTitle}</h3>
          </div>

          {/* 日毎グリッド */}
          {draft.days.map((day) => (
            <div key={day.day_index} className="rounded-2xl bg-white shadow-sm overflow-hidden">
              <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                <span className="text-xs font-bold text-gray-700">{DAY_NAMES[day.day_index]}</span>
              </div>
              <div className="divide-y divide-gray-50">
                {(["breakfast", "lunch", "dinner"] as const).map((mealType) => {
                  const slot = day[mealType];
                  if (!slot) return null;
                  return (
                    <div key={mealType} className="flex gap-3 px-4 py-3">
                      <span className="text-xs font-semibold text-gray-400 w-12 shrink-0 pt-0.5">
                        {MEAL_LABELS[mealType]}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">{slot.title}</p>
                        {slot.description && (
                          <p className="text-xs text-gray-400 mt-0.5">{slot.description}</p>
                        )}
                        <div className="flex gap-2 mt-1">
                          <span className="text-[10px] text-gray-400">{slot.prep_time}分</span>
                          <span className="text-[10px] bg-gray-100 rounded-full px-1.5">{slot.category}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* 保存ボタン */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#A7C957] py-3.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <Save size={18} />
                この献立を保存する
              </>
            )}
          </motion.button>
        </motion.div>
      )}

      {/* ヒント */}
      {!loading && !draft && (
        <div className="flex items-start gap-3 rounded-xl bg-green-50 p-4">
          <Utensils size={20} className="text-[#A7C957] shrink-0 mt-0.5" />
          <p className="text-xs text-gray-600 leading-relaxed">
            あなたのレベル（Lv.{userLevel}）に合った{days}日間の献立をAIが考えます。
            苦手な食材や好みを入力するとより精度が上がります。
          </p>
        </div>
      )}
    </div>
  );
}
