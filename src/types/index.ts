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
