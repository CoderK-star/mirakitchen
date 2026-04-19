-- ============================================================
-- 003_ai_features.sql  — AI機能対応スキーマ拡張
-- ============================================================

-- ① recipes テーブルへのカラム追加
ALTER TABLE recipes
  ADD COLUMN IF NOT EXISTS created_by      uuid REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS source_url      text,
  ADD COLUMN IF NOT EXISTS is_ai_generated boolean NOT NULL DEFAULT false;

-- 既存の公開レシピには created_by = NULL（全ユーザー参照可）のまま
-- AI生成レシピは created_by = ユーザーID + is_ai_generated = true

-- ② RLS ポリシー更新（recipes）
-- 既存 SELECT ポリシーを削除して再作成
DROP POLICY IF EXISTS "recipes_select" ON recipes;
CREATE POLICY "recipes_select" ON recipes
  FOR SELECT USING (
    -- 公開レシピ（管理者が登録したもの） OR 自分が生成したレシピ
    created_by IS NULL
    OR created_by = auth.uid()
  );

-- INSERT: 認証ユーザーは自分のAI生成レシピを追加可能
DROP POLICY IF EXISTS "recipes_insert" ON recipes;
CREATE POLICY "recipes_insert" ON recipes
  FOR INSERT WITH CHECK (
    created_by = auth.uid()
  );

-- UPDATE / DELETE: 自分が作ったレシピのみ
DROP POLICY IF EXISTS "recipes_update" ON recipes;
CREATE POLICY "recipes_update" ON recipes
  FOR UPDATE USING (created_by = auth.uid());

DROP POLICY IF EXISTS "recipes_delete" ON recipes;
CREATE POLICY "recipes_delete" ON recipes
  FOR DELETE USING (created_by = auth.uid());

-- recipe_steps への INSERT / UPDATE / DELETE も自分のレシピのステップのみ可能に
DROP POLICY IF EXISTS "recipe_steps_insert" ON recipe_steps;
CREATE POLICY "recipe_steps_insert" ON recipe_steps
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM recipes WHERE id = recipe_id AND created_by = auth.uid())
  );

DROP POLICY IF EXISTS "recipe_steps_update" ON recipe_steps;
CREATE POLICY "recipe_steps_update" ON recipe_steps
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM recipes WHERE id = recipe_id AND created_by = auth.uid())
  );

DROP POLICY IF EXISTS "recipe_steps_delete" ON recipe_steps;
CREATE POLICY "recipe_steps_delete" ON recipe_steps
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM recipes WHERE id = recipe_id AND created_by = auth.uid())
  );

-- ③ meal_plans テーブル
CREATE TABLE IF NOT EXISTS meal_plans (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title       text NOT NULL,
  start_date  date,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "meal_plans_crud" ON meal_plans
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ④ meal_plan_items テーブル
CREATE TABLE IF NOT EXISTS meal_plan_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id  uuid NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
  day_index     integer NOT NULL CHECK (day_index >= 0),  -- 0=1日目, 1=2日目, ...
  meal_type     text NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
  recipe_id     uuid REFERENCES recipes(id) ON DELETE SET NULL,
  custom_title  text,
  note          text
);

ALTER TABLE meal_plan_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "meal_plan_items_crud" ON meal_plan_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM meal_plans WHERE id = meal_plan_id AND user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM meal_plans WHERE id = meal_plan_id AND user_id = auth.uid())
  );

-- ⑤ Supabase Storage バケット（recipe-images）
-- ※ Supabase Storage はダッシュボードまたは CLI で作成が推奨
--   以下は storage.buckets への直接 INSERT（self-hosted / CLI 向け）
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'recipe-images',
    'recipe-images',
    true,
    5242880,  -- 5MB
    ARRAY['image/png', 'image/jpeg', 'image/webp']
  )
  ON CONFLICT (id) DO NOTHING;

-- Storage RLS（公開バケットなのでオブジェクトは誰でも参照可）
CREATE POLICY "recipe_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'recipe-images');

CREATE POLICY "recipe_images_auth_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'recipe-images' AND auth.role() = 'authenticated'
  );
