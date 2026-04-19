// ============================================================
// Mirakitchen — TypeScript 型定義
// ============================================================

// --------------- 共通 ---------------

export type UUID = string

// --------------- データベース行型 ---------------

export interface Profile {
  id: UUID
  username: string
  level: number
  total_xp: number
  created_at: string
}

export interface Recipe {
  id: UUID
  title: string
  description: string | null
  difficulty_level: 1 | 2 | 3 | 4 | 5
  prep_time: number // 分
  image_url: string | null
  category: RecipeCategory
  required_level: number
  xp_reward: number
  created_at: string
  // AI機能拡張フィールド
  created_by: UUID | null
  source_url: string | null
  is_ai_generated: boolean
}

export interface RecipeStep {
  id: UUID
  recipe_id: UUID
  step_number: number
  instruction: string
  image_url: string | null
  tip: string | null
}

export interface UserHistory {
  id: UUID
  user_id: UUID
  recipe_id: UUID
  completed_at: string
  xp_gained: number
}

export interface ShoppingListItem {
  id: UUID
  user_id: UUID
  name: string
  checked: boolean
  recipe_id: UUID | null
  created_at: string
}

// --------------- ユニオン型 ---------------

export type RecipeCategory =
  | '包丁不要'
  | 'レンジのみ'
  | 'フライパン1つ'
  | '鍋1つ'
  | '混ぜるだけ'

export type DifficultyLevel = 1 | 2 | 3 | 4 | 5

// --------------- 複合型（JOIN 結果等）---------------

export interface RecipeWithSteps extends Recipe {
  recipe_steps: RecipeStep[]
}

export interface RecipeCardData
  extends Pick<
    Recipe,
    | 'id'
    | 'title'
    | 'description'
    | 'difficulty_level'
    | 'prep_time'
    | 'image_url'
    | 'category'
    | 'required_level'
    | 'xp_reward'
  > {}

// --------------- XP / レベル ---------------

export interface LevelInfo {
  level: number
  currentXp: number
  nextLevelXp: number
  progressPercent: number
}

// --------------- UI 状態型 ---------------

export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface CookingSession {
  recipeId: UUID
  currentStep: number
  totalSteps: number
  startedAt: Date
}

// ============================================================
// AI 機能関連型
// ============================================================

// --------------- 献立 ---------------

export type MealType = 'breakfast' | 'lunch' | 'dinner'

export interface MealPlan {
  id: UUID
  user_id: UUID
  title: string
  start_date: string | null
  created_at: string
}

export interface MealPlanItem {
  id: UUID
  meal_plan_id: UUID
  day_index: number
  meal_type: MealType
  recipe_id: UUID | null
  custom_title: string | null
  note: string | null
}

export interface MealPlanWithItems extends MealPlan {
  meal_plan_items: MealPlanItem[]
}

// --------------- AI 生成レシピ（プレビュー）---------------

/** AI が生成したがまだ DB 未保存のレシピ草稿 */
export interface AiRecipeDraft {
  title: string
  description: string
  difficulty_level: DifficultyLevel
  prep_time: number
  category: RecipeCategory
  required_level: number
  xp_reward: number
  steps: AiRecipeStepDraft[]
  generatedImageUrl?: string | null
}

export interface AiRecipeStepDraft {
  step_number: number
  instruction: string
  tip: string | null
}

// --------------- AI 献立（プレビュー）---------------

export interface AiMealPlanDay {
  day_index: number
  breakfast: AiMealSlot | null
  lunch: AiMealSlot | null
  dinner: AiMealSlot | null
}

export interface AiMealSlot {
  title: string
  description: string | null
  prep_time: number
  category: RecipeCategory
  note: string | null
}

export interface AiMealPlanDraft {
  planTitle: string
  days: AiMealPlanDay[]
}

// --------------- Web 検索結果 ---------------

export interface WebSearchRecipe {
  title: string
  description: string
  sourceUrl: string
  sourceName: string
  prep_time: number | null
  category: RecipeCategory | null
}
