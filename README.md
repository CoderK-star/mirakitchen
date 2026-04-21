# Mirakitchen

自炊初心者を育てる **RPG 風料理アプリ**。料理をゲームのように楽しみながら、一人暮らしでも自炊力を段階的に身につけられます。

---

## 開発経緯

最近自炊を始めようと思い、動画や記事を調べたが、ソースによって手順やガイドが違ったり、知らない用語もあるので調べるたびに手が止まった。またどの情報も汎用的すぎて「今の自分のスキルレベルに合ったガイド」が見つからないという問題もある。

既存のレシピアプリ（クラシル、デリッシュキッチンなど）を試してみても、多くは「すでに基礎的な調理スキルがある人向け」の設計で、初心者が達成感を得たり長く続けるための仕組みが弱い。「一品作れた」という成功体験が積み上がらずに終わることがあるなと感じた。

そこで、**ゲームデザイン風に設計しよう**という方針にした。RPG のレベルシステムを入れて、段階的に難易度が上がる学習体験を作った。レシピ完了で XP を獲得し、レベルが上がると新しいレシピが解放され、継続しやすいように工夫した。また、AI シェフ機能により、細かい質問だったり、スキルに応じてAIと会話してアドバイスをもらうことができる。

---

## プロジェクト概要

| 項目 | 内容 |
|------|------|
| **コンセプト** | 「自炊のパーソナルトレーナー」×「ゆるい RPG 世界観」 |
| **ターゲット** | 20–30代、一人暮らし・自炊経験ゼロ|
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
| 買い物リスト | レシピから食材を追加・チェック管理 |
| 食材辞典 | 切り方・保存方法などの Tips を確認 |

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

## 利用可能なスクリプト

| コマンド | 説明 |
|----------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm run start` | 本番サーバー起動 |
| `npm run lint` | ESLint 実行 |

---

## 今後の展開
技術構成についてはモバイルファーストを前提に設計した。将来的な React Native などのフレームワークに移行は検討しているが、まず Web で MVPを構築した。今後、使用しながらモバイルアプリ化や機能の追加をやっていく予定。