"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, CheckCircle2, Circle, ShoppingCart } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { haptics } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { ShoppingListItem } from "@/types";

const QUERY_KEY = ["shopping-list"] as const;

async function fetchItems(): Promise<ShoppingListItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("shopping_list_items")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

/**
 * 買い物リスト (DESIGN.md §5 / AGENT.md Phase 3)
 * Supabase + TanStack Query による楽観的更新実装
 */
export function CartList() {
  const qc = useQueryClient();
  const supabase = createClient();
  const [input, setInput] = useState("");

  // ── フェッチ ───────────────────────────────────────────
  const { data: items = [], isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchItems,
  });

  // ── 追加 ──────────────────────────────────────────────
  const addMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error("ログインが必要です");
      const { data, error } = await supabase
        .from("shopping_list_items")
        .insert({ user_id: userId, name })
        .select()
        .single<ShoppingListItem>();
      if (error) throw new Error(error.message);
      return data;
    },
    onMutate: async (name) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY });
      const prev = qc.getQueryData<ShoppingListItem[]>(QUERY_KEY);
      const optimistic: ShoppingListItem = {
        id: crypto.randomUUID(),
        user_id: "",
        name,
        checked: false,
        recipe_id: null,
        created_at: new Date().toISOString(),
      };
      qc.setQueryData<ShoppingListItem[]>(QUERY_KEY, (old = []) => [
        ...old,
        optimistic,
      ]);
      return { prev };
    },
    onError: (_err, _name, ctx) => {
      qc.setQueryData(QUERY_KEY, ctx?.prev);
      toast.error("追加に失敗しました");
    },
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  // ── チェック切り替え ────────────────────────────────────
  const toggleMutation = useMutation({
    mutationFn: async ({ id, checked }: { id: string; checked: boolean }) => {
      const { error } = await supabase
        .from("shopping_list_items")
        .update({ checked })
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onMutate: async ({ id, checked }) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY });
      const prev = qc.getQueryData<ShoppingListItem[]>(QUERY_KEY);
      qc.setQueryData<ShoppingListItem[]>(QUERY_KEY, (old = []) =>
        old.map((it) => (it.id === id ? { ...it, checked } : it))
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      qc.setQueryData(QUERY_KEY, ctx?.prev);
      toast.error("更新に失敗しました");
    },
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  // ── 削除 ──────────────────────────────────────────────
  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("shopping_list_items")
        .delete()
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY });
      const prev = qc.getQueryData<ShoppingListItem[]>(QUERY_KEY);
      qc.setQueryData<ShoppingListItem[]>(QUERY_KEY, (old = []) =>
        old.filter((it) => it.id !== id)
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      qc.setQueryData(QUERY_KEY, ctx?.prev);
      toast.error("削除に失敗しました");
    },
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  // ── チェック済みを一括削除 ──────────────────────────────
  const clearCheckedMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from("shopping_list_items")
        .delete()
        .in("id", ids);
      if (error) throw new Error(error.message);
    },
    onMutate: async (ids) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY });
      const prev = qc.getQueryData<ShoppingListItem[]>(QUERY_KEY);
      qc.setQueryData<ShoppingListItem[]>(QUERY_KEY, (old = []) =>
        old.filter((it) => !ids.includes(it.id))
      );
      return { prev };
    },
    onSuccess: () => toast.success("チェック済みをクリアしました"),
    onError: (_err, _ids, ctx) => {
      qc.setQueryData(QUERY_KEY, ctx?.prev);
      toast.error("クリアに失敗しました");
    },
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  // ── ハンドラー ─────────────────────────────────────────
  function handleAdd() {
    const name = input.trim();
    if (!name) return;
    haptics.light();
    addMutation.mutate(name);
    setInput("");
  }

  function handleToggle(id: string, currentChecked: boolean) {
    haptics.medium();
    toggleMutation.mutate({ id, checked: !currentChecked });
  }

  function handleRemove(id: string) {
    haptics.light();
    removeMutation.mutate(id);
  }

  function handleClearChecked() {
    const ids = items.filter((it) => it.checked).map((it) => it.id);
    if (ids.length === 0) return;
    haptics.medium();
    clearCheckedMutation.mutate(ids);
  }

  const unchecked = items.filter((it) => !it.checked);
  const checked = items.filter((it) => it.checked);

  return (
    <div className="flex flex-col gap-4">
      {/* 追加フォーム */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="食材・商品名を入力…"
          aria-label="買い物リストに追加する食材名"
          className="flex-1 h-12 rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#FF8C00]/40 focus:border-[#FF8C00] transition min-h-[44px]"
        />
        <button
          onClick={handleAdd}
          disabled={!input.trim() || addMutation.isPending}
          aria-label="リストに追加"
          className="h-12 w-12 rounded-2xl bg-[#FF8C00] text-white flex items-center justify-center shadow-sm active:scale-95 transition disabled:opacity-40 min-h-[44px] min-w-[44px]"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* ローディング */}
      {isLoading && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="shimmer h-14 rounded-2xl" />
          ))}
        </div>
      )}

      {/* 空状態 */}
      {!isLoading && items.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16">
          <ShoppingCart size={48} className="text-gray-200" />
          <p className="text-gray-400 text-sm">まだリストに何もありません</p>
          <p className="text-gray-300 text-xs">食材名を入力して追加しましょう</p>
        </div>
      )}

      {/* 未チェック */}
      {unchecked.length > 0 && (
        <ul className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {unchecked.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                onToggle={handleToggle}
                onRemove={handleRemove}
              />
            ))}
          </AnimatePresence>
        </ul>
      )}

      {/* チェック済み */}
      {checked.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-400">
              チェック済み（{checked.length}）
            </p>
            <button
              onClick={handleClearChecked}
              disabled={clearCheckedMutation.isPending}
              className="text-xs text-red-400 font-medium min-h-[44px] px-2 flex items-center gap-1 disabled:opacity-50"
            >
              <Trash2 size={12} />
              クリア
            </button>
          </div>
          <ul className="flex flex-col gap-2 opacity-60">
            <AnimatePresence initial={false}>
              {checked.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  onToggle={handleToggle}
                  onRemove={handleRemove}
                />
              ))}
            </AnimatePresence>
          </ul>
        </div>
      )}
    </div>
  );
}

function ItemRow({
  item,
  onToggle,
  onRemove,
}: {
  item: ShoppingListItem;
  onToggle: (id: string, checked: boolean) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 32, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 350, damping: 28 }}
      className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm min-h-[44px]"
    >
      <button
        onClick={() => onToggle(item.id, item.checked)}
        aria-label={item.checked ? "チェックを外す" : "チェックする"}
        className="shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center -mx-2"
      >
        {item.checked ? (
          <CheckCircle2 size={22} className="text-[#A7C957]" />
        ) : (
          <Circle size={22} className="text-gray-300" />
        )}
      </button>
      <span
        className={cn(
          "flex-1 text-sm text-gray-800 leading-snug",
          item.checked && "line-through text-gray-400"
        )}
      >
        {item.name}
      </span>
      <button
        onClick={() => onRemove(item.id)}
        aria-label={`${item.name}を削除`}
        className="shrink-0 text-gray-300 hover:text-red-400 transition min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2"
      >
        <Trash2 size={16} />
      </button>
    </motion.li>
  );
}
