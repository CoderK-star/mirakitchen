"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { COOKING_TERMS } from "@/lib/cooking-terms";

export function CookingTermsList() {
  const [openTerm, setOpenTerm] = useState<string | null>(null);

  const toggle = (term: string) =>
    setOpenTerm((prev) => (prev === term ? null : term));

  return (
    <div className="flex flex-col gap-4">
      {/* 説明バナー */}
      <div className="bg-purple-50 border border-purple-100 rounded-2xl px-4 py-3">
        <p className="text-sm text-purple-700 font-semibold">
          📖 レシピの「わからない言葉」はここで確認！
        </p>
        <p className="text-xs text-purple-600 mt-0.5">
          「少々って何グラム？」「中火ってどのくらい？」を一発解決。
        </p>
      </div>

      {/* 用語リスト */}
      <ul className="flex flex-col gap-2">
        {COOKING_TERMS.map((t) => {
          const isOpen = openTerm === t.term;
          return (
            <li
              key={t.term}
              className="bg-white rounded-2xl shadow-sm overflow-hidden"
            >
              <button
                onClick={() => toggle(t.term)}
                className="w-full flex items-center gap-3 px-4 py-3 min-h-[56px] text-left"
                aria-expanded={isOpen}
              >
                <span className="text-2xl shrink-0">{t.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-gray-800">
                    {t.term}
                    <span className="ml-1.5 text-xs font-normal text-gray-400">
                      ({t.reading})
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 truncate">{t.plain}</p>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4">
                      {/* 一言説明 */}
                      <div className="bg-purple-50 rounded-xl px-3 py-2.5 mb-2">
                        <p className="text-xs font-semibold text-purple-700 mb-0.5">
                          ひと言で言うと
                        </p>
                        <p className="text-sm font-semibold text-gray-800">
                          {t.plain}
                        </p>
                      </div>
                      {/* 詳細説明 */}
                      <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                        <p className="text-xs font-semibold text-gray-500 mb-0.5">
                          もう少し詳しく
                        </p>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {t.detail}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
