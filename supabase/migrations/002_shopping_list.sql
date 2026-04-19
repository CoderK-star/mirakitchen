  -- ============================================================
  -- Mirakitchen — 買い物リストテーブル
  -- ============================================================

  create table if not exists shopping_list_items (
    id         uuid primary key default gen_random_uuid(),
    user_id    uuid not null references profiles on delete cascade,
    name       text not null,
    checked    boolean not null default false,
    recipe_id  uuid references recipes on delete set null, -- どのレシピから追加したか（任意）
    created_at timestamptz not null default now()
  );

  -- Row Level Security
  alter table shopping_list_items enable row level security;

  create policy "自分のアイテムのみ参照可"
    on shopping_list_items for select
    using (auth.uid() = user_id);

  create policy "自分のアイテムのみ追加可"
    on shopping_list_items for insert
    with check (auth.uid() = user_id);

  create policy "自分のアイテムのみ更新可"
    on shopping_list_items for update
    using (auth.uid() = user_id);

  create policy "自分のアイテムのみ削除可"
    on shopping_list_items for delete
    using (auth.uid() = user_id);
