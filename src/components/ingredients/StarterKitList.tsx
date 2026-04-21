"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { STARTER_TOOLS, STARTER_SEASONINGS } from "@/lib/starter-kit";

export function StarterKitList() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) =>
    setOpenId((prev) => (prev === id ? null : id));

  return (
    <div className="flex flex-col gap-6">
      {/* 説明バナー */}
      <div className="bg-orange-50 border border-orange-100 rounded-2xl px-4 py-3">
        <p className="text-sm text-[#FF8C00] font-semibold">
          🎒 まず「これだけ」揃えれば大丈夫！
        </p>
        <p className="text-xs text-orange-700 mt-0.5">
          器具3点＋調味料5点。合計でも 3,000〜5,000円以内に収まります。
        </p>
      </div>

      {/* 調理器具セクション */}
      <section>
        <h2 className="text-base font-bold text-gray-700 mb-2 flex items-center gap-1.5">
          🍳 調理器具 <span className="text-xs font-normal text-gray-400">— 3点</span>
        </h2>
        <ul className="flex flex-col gap-2">
          {STARTER_TOOLS.map((tool) => {
            const isOpen = openId === tool.name;
            return (
              <li key={tool.name} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <button
                  onClick={() => toggle(tool.name)}
                  className="w-full flex items-center gap-3 px-4 py-3 min-h-[56px] text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-2xl shrink-0">{tool.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-800 truncate">
                      {tool.name}
                    </p>
                    <p className="text-xs text-gray-400">{tool.budget}</p>
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
                      <div className="px-4 pb-4 flex flex-col gap-2">
                        <div className="bg-green-50 rounded-xl px-3 py-2">
                          <p className="text-xs font-semibold text-green-700 mb-0.5">
                            なぜ必要？
                          </p>
                          <p className="text-sm text-gray-700">{tool.reason}</p>
                        </div>
                        <div className="bg-blue-50 rounded-xl px-3 py-2">
                          <p className="text-xs font-semibold text-blue-700 mb-0.5">
                            💡 選び方のコツ
                          </p>
                          <p className="text-sm text-gray-700">{tool.tip}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </section>

      {/* 調味料セクション */}
      <section>
        <h2 className="text-base font-bold text-gray-700 mb-2 flex items-center gap-1.5">
          🧂 調味料 <span className="text-xs font-normal text-gray-400">— 5点</span>
        </h2>
        <ul className="flex flex-col gap-2">
          {STARTER_SEASONINGS.map((s) => {
            const isOpen = openId === s.name;
            return (
              <li key={s.name} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <button
                  onClick={() => toggle(s.name)}
                  className="w-full flex items-center gap-3 px-4 py-3 min-h-[56px] text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-2xl shrink-0">{s.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-800 truncate">
                      {s.name}
                    </p>
                    <p className="text-xs text-gray-400">{s.budget}</p>
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
                      <div className="px-4 pb-4 flex flex-col gap-2">
                        <div className="bg-green-50 rounded-xl px-3 py-2">
                          <p className="text-xs font-semibold text-green-700 mb-0.5">
                            なぜ必要？
                          </p>
                          <p className="text-sm text-gray-700">{s.reason}</p>
                        </div>
                        <div className="bg-blue-50 rounded-xl px-3 py-2">
                          <p className="text-xs font-semibold text-blue-700 mb-0.5">
                            💡 選び方のコツ
                          </p>
                          <p className="text-sm text-gray-700">{s.tip}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
