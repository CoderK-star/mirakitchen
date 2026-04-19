import type { LevelInfo } from "@/types";

/** レベルに必要な累計 XP テーブル (AGENT.md §4) */
const XP_TABLE: Record<number, number> = {
  1: 0,
  2: 100,
  3: 250,
  4: 500,
  5: 900,
};

/** Lv.N の累計XP必要量を計算（6以上は前レベル × 1.6） */
export function requiredXpForLevel(level: number): number {
  if (level <= 1) return 0;
  if (XP_TABLE[level] !== undefined) return XP_TABLE[level];

  let xp = XP_TABLE[5];
  for (let l = 6; l <= level; l++) {
    xp = Math.floor(xp * 1.6);
  }
  return xp;
}

/** 総合XPからレベル情報を計算 */
export function calcLevelInfo(totalXp: number): LevelInfo {
  let level = 1;
  while (requiredXpForLevel(level + 1) <= totalXp) {
    level++;
  }

  const currentLevelXp = requiredXpForLevel(level);
  const nextLevelXp = requiredXpForLevel(level + 1);
  const currentXp = totalXp - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;
  const progressPercent = Math.min(100, Math.round((currentXp / xpNeeded) * 100));

  return {
    level,
    currentXp,
    nextLevelXp: xpNeeded,
    progressPercent,
  };
}
