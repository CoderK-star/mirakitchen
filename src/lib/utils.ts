import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { LevelInfo } from '@/types'

// --------------- Tailwind クラス結合ユーティリティ ---------------

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// --------------- XP / レベル計算 ---------------

/** レベルに必要な累計 XP */
export function getRequiredXp(level: number): number {
  if (level <= 1) return 0
  if (level === 2) return 100
  if (level === 3) return 250
  if (level === 4) return 500
  if (level === 5) return 900
  // Lv.6 以上: 前レベル必要 XP × 1.6
  return Math.floor(getRequiredXp(level - 1) * 1.6)
}

/** 累計 XP から現在のレベル情報を計算する */
export function calcLevelInfo(totalXp: number): LevelInfo {
  let level = 1
  while (getRequiredXp(level + 1) <= totalXp) {
    level++
  }
  const currentLevelXp = getRequiredXp(level)
  const nextLevelXp = getRequiredXp(level + 1)
  const progressPercent = Math.min(
    100,
    Math.floor(((totalXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100),
  )
  return {
    level,
    currentXp: totalXp - currentLevelXp,
    nextLevelXp: nextLevelXp - currentLevelXp,
    progressPercent,
  }
}

/** レベルアップが発生するか判定する（XP 付与前後を比較）*/
export function didLevelUp(xpBefore: number, xpAfter: number): boolean {
  return calcLevelInfo(xpBefore).level < calcLevelInfo(xpAfter).level
}

// --------------- 表示ユーティリティ ---------------

/** 分を "5分" or "1時間30分" に変換 */
export function formatPrepTime(minutes: number): string {
  if (minutes < 60) return `${minutes}分`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}時間` : `${h}時間${m}分`
}
