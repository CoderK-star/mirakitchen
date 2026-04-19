/**
 * 触覚フィードバックユーティリティ (DESIGN.md §7.6)
 * Web Vibration API は iOS Safari では非対応のため、オプショナル呼び出しを徹底する。
 */
export const haptics = {
  /** 軽いタップ感（ボタン押下・カード選択） */
  light: () => navigator.vibrate?.(10),
  /** 中程度（ステップ完了・チェック追加） */
  medium: () => navigator.vibrate?.(25),
  /** 強め（料理完了・XP獲得・レベルアップ） */
  success: () => navigator.vibrate?.([15, 50, 30]),
  /** エラー（バリデーション失敗・通信エラー） */
  error: () => navigator.vibrate?.([10, 30, 10, 30, 10]),
};
