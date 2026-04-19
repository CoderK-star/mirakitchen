# Mirakitchen

自炊ビギナーを育てる **RPG 風クッキングアプリ**。料理をゲームのように楽しみながら、一人暮らしでも自炊力を段階的に身につけられます。

---

## プロジェクト概要

| 項目 | 内容 |
|------|------|
| **コンセプト** | 「自炊のパーソナルトレーナー」×「ゆるい RPG 世界観」 |
| **ターゲット** | 20–30 代一人暮らし・自炊経験ほぼゼロ層 |
| **フレームワーク** | Next.js 16 (App Router) |
| **バックエンド** | Supabase（Auth・DB・RLS） |
| **スタイリング** | Tailwind CSS v4 + shadcn/ui |
| **アニメーション** | Framer Motion |
| **状態管理** | TanStack Query v5 |

---

## 主な機能

| 機能 | 説明 |
|------|------|
| レベル別レシピ | Lv.1（包丁不要）〜 Lv.5 まで段階的に解放 |
| 調理モード | 1画面 1ステップ。大きな文字と画像で迷わず調理 |
| XP・レベルアップ | レシピ完了で XP 獲得 → レベルが上がり新レシピが解放 |
| 買い物リスト | レシピから食材を一键追加・チェック管理 |
| 食材辞典 | 切り方・保存方法などの Tips を確認 |

---

## ディレクトリ構造

```
mirakitchen/
├── src/
│   ├── app/
│   │   ├── (auth)/          # ログイン・サインアップ画面
│   │   ├── (main)/          # メインアプリ（home / recipes / cart / profile）
│   │   └── actions/         # Server Actions
│   ├── components/          # UI コンポーネント
│   ├── lib/                 # Supabase クライアント・ユーティリティ
│   ├── types/               # 型定義
│   └── proxy.ts             # 認証ミドルウェア（Next.js proxy）
└── supabase/
    └── migrations/          # DB スキーマ（SQL）
```

---

## ローカル開発のセットアップ

### 1. リポジトリのクローン

```bash
git clone <YOUR_REPO_URL>
cd mirakitchen
```

### 2. 依存パッケージのインストール

```bash
npm install
```

### 3. Supabase プロジェクトの作成

#### 3-1. アカウント・プロジェクト作成

1. [https://supabase.com](https://supabase.com) にアクセスしてサインアップ（無料プランで可）
2. ダッシュボードで **「New project」** をクリック
3. 以下を入力してプロジェクトを作成する

   | 項目 | 例 |
   |------|----|
   | Project name | `mirakitchen` |
   | Database Password | （任意の強力なパスワード） |
   | Region | `Northeast Asia (Tokyo)` 推奨 |

4. プロジェクトの起動まで約 1〜2 分待つ

#### 3-2. API キーの取得

1. ダッシュボード左サイドバー → **「Project Settings」** → **「API」**
2. 以下の値をメモする

   | 変数名 | 取得場所 |
   |--------|----------|
   | `NEXT_PUBLIC_SUPABASE_URL` | **Project URL** |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Project API keys** → `anon` `public` |

#### 3-3. 環境変数ファイルの作成

プロジェクトルート（`mirakitchen/`）に `.env.local` を作成する。

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> ⚠️ **重要:** `NEXT_PUBLIC_SUPABASE_URL` は必ず `https://` から始まる完全な URL を設定してください。
> 未設定・空文字の場合 **`Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL`** エラーが発生します。

#### 3-4. データベーススキーマの適用

Supabase ダッシュボードの **「SQL Editor」** で以下のファイルの内容を **順番に** 実行する。

| 順番 | ファイル | 内容 |
|------|----------|------|
| 1 | `supabase/migrations/001_init.sql` | profiles / recipes / recipe_steps / user_history テーブル |
| 2 | `supabase/migrations/002_shopping_list.sql` | 買い物リストテーブル |

> **Supabase CLI を使う場合（オプション）:**
>
> ```bash
> npx supabase login
> npx supabase link --project-ref <PROJECT_REF>
> npx supabase db push
> ```

#### 3-5. Auth 設定（メール認証）

1. ダッシュボード → **「Authentication」** → **「Providers」**
2. **Email** が有効になっていることを確認
3. 開発中は **「Confirm email」を OFF** にすると即ログインできて便利

#### 3-6. サンプルデータの投入（任意）

「SQL Editor」でサンプルレシピを挿入するか、**Table Editor** から手動追加する。

```sql
-- レベル1 レシピの例
INSERT INTO recipes (title, description, difficulty_level, prep_time, category, required_level, xp_reward)
VALUES ('電子レンジで作る温泉卵', '包丁も火も不要！レンジで5分', 1, 5, '卵料理', 1, 50);
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) をブラウザで開く。

---

## Vercel へのデプロイ

### 1. Vercel アカウントの準備

1. [https://vercel.com](https://vercel.com) にアクセスし、GitHub アカウントでサインアップ（無料プランで可）

### 2. リポジトリを GitHub にプッシュ

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin <YOUR_REPO_URL>
git push -u origin main
```

### 3. Vercel にプロジェクトをインポート

1. Vercel ダッシュボード → **「Add New... → Project」**
2. GitHub リポジトリ一覧から `mirakitchen` を選択し **「Import」**
3. Framework Preset が **Next.js** になっていることを確認
4. **「Environment Variables」** セクションで以下を追加する

   | 変数名                          | 値                              |
   |---------------------------------|---------------------------------|
   | `NEXT_PUBLIC_SUPABASE_URL`      | Supabase の Project URL         |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase の `anon` `public` キー |
   | `GOOGLE_GENERATIVE_AI_API_KEY`  | Google Generative AI API キー  |

5. **「Deploy」** をクリック

### 4. Supabase の Auth リダイレクト URL を更新

デプロイ後、Supabase 側で本番 URL を許可リストに追加する。

1. Supabase ダッシュボード → **「Authentication」** → **「URL Configuration」**
2. **Site URL** を Vercel のデプロイ URL に変更（例: `https://mirakitchen.vercel.app`）
3. **Redirect URLs** に以下を追加する

   ```text
   https://mirakitchen.vercel.app/**
   ```

### 5. 継続的デプロイ

`main` ブランチへのプッシュが自動的に本番デプロイされます。
プルリクエストごとにプレビュー URL が生成されます。

> **カスタムドメインを使う場合:** Vercel ダッシュボード → プロジェクト → **「Settings」** → **「Domains」** からドメインを追加し、DNS レコードを設定してください。

---

## 利用可能なスクリプト

| コマンド | 説明 |
|----------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm run start` | 本番サーバー起動 |
| `npm run lint` | ESLint 実行 |

---

## データベーススキーマ

```
profiles              ユーザーのレベル・XP 管理
recipes               レシピ基本情報
recipe_steps          調理ステップ（1 レシピ複数）
user_history          料理完了ログ
shopping_list_items   買い物リスト
```

全テーブルに **Row Level Security (RLS)** を適用済み。ユーザーは自分のデータのみ参照・操作可能。

---

## トラブルシューティング

### `Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL`

`.env.local` が存在しない、または `NEXT_PUBLIC_SUPABASE_URL` が未設定・空です。
→「3-3. 環境変数ファイルの作成」を参照して設定してください。

### `Both middleware file and proxy file are detected`

`src/middleware.ts` と `src/proxy.ts` が両方存在しています。
→ `src/middleware.ts` の中身を確認し、`proxy.ts` を呼び出す形になっているか確認してください。

### ログインで 400 エラーが発生する

以下を順番に確認してください。

1. **Vercel の環境変数が設定されているか**  
   Vercel ダッシュボード → Settings → Environment Variables に `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` が設定されているか確認し、設定後は Redeploy する。

2. **本番 Supabase にアカウントが存在するか**  
   ローカルで作成したアカウントは本番 Supabase には存在しません。`https://<あなたのVercelURL>/signup` から新規登録してください。

3. **メール確認が有効になっている場合**  
   Supabase → Authentication → Providers → Email → **「Confirm email」を OFF** にするか、登録メールの確認リンクをクリックしてください。

4. **Supabase の Site URL が未更新の場合**  
   Supabase → Authentication → URL Configuration → Site URL を本番 URL に変更してください。

---

## 技術スタック

| カテゴリ | ライブラリ / サービス |
|----------|-----------------------|
| フレームワーク | Next.js 16 |
| 認証・DB | Supabase |
| UI コンポーネント | shadcn/ui |
| スタイリング | Tailwind CSS v4 |
| アニメーション | Framer Motion |
| 非同期状態管理 | TanStack Query v5 |
| トースト通知 | Sonner |
| アイコン | Lucide React |
| コンフェッティ | canvas-confetti |
