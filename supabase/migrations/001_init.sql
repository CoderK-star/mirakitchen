-- ============================================================
-- Mirakitchen — 初期スキーマ
-- ============================================================

-- profiles: ユーザーのレベルと XP 管理
create table if not exists profiles (
  id         uuid primary key references auth.users on delete cascade,
  username   text not null,
  level      integer not null default 1,
  total_xp   integer not null default 0,
  created_at timestamptz not null default now()
);

-- ユーザー登録時に profiles を自動作成するトリガー
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- recipes: レシピ基本情報
create table if not exists recipes (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  description      text,
  difficulty_level integer not null check (difficulty_level between 1 and 5),
  prep_time        integer not null,
  image_url        text,
  category         text not null,
  required_level   integer not null default 1,
  xp_reward        integer not null default 50,
  created_at       timestamptz not null default now()
);

-- recipe_steps: 1 ステップずつの調理手順
create table if not exists recipe_steps (
  id          uuid primary key default gen_random_uuid(),
  recipe_id   uuid not null references recipes on delete cascade,
  step_number integer not null,
  instruction text not null,
  image_url   text,
  tip         text
);

-- user_history: 料理完了ログ
create table if not exists user_history (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles on delete cascade,
  recipe_id    uuid not null references recipes,
  completed_at timestamptz not null default now(),
  xp_gained    integer not null
);

-- RLS (Row Level Security)
alter table profiles    enable row level security;
alter table user_history enable row level security;

create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can view own history"
  on user_history for select using (auth.uid() = user_id);

create policy "Users can insert own history"
  on user_history for insert with check (auth.uid() = user_id);

-- recipes と recipe_steps は全ユーザーが読み取り可能
alter table recipes      enable row level security;
alter table recipe_steps enable row level security;

create policy "Anyone can view recipes"
  on recipes for select using (true);

create policy "Anyone can view recipe steps"
  on recipe_steps for select using (true);

-- ============================================================
-- シードデータ（サンプルレシピ）
-- ============================================================

insert into recipes (title, description, difficulty_level, prep_time, category, required_level, xp_reward)
values
  ('目玉焼き', '包丁いらず！フライパン1つで作れる超初心者レシピ。朝食の定番。', 1, 5, 'フライパン1つ', 1, 30),
  ('カット野菜の塩炒め', '袋入りカット野菜を使うので切る手間ゼロ。フライパン1つで完結。', 1, 8, 'フライパン1つ', 1, 40),
  ('レンジ蒸し鶏', '耐熱容器と電子レンジだけ。火を使わずにしっとり鶏肉が完成。', 2, 15, 'レンジのみ', 2, 60),
  ('ゆで卵（半熟・固ゆで）', 'お湯を沸かすだけ。時間で仕上がりが変わる料理の基礎。', 1, 12, '鍋1つ', 1, 35),
  ('カップ麺アレンジ丼', 'カップ麺に目玉焼きとカット野菜を乗せるだけ。立派な一食に。', 1, 10, '混ぜるだけ', 1, 25)
on conflict do nothing;
