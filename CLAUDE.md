@AGENTS.md

# baby-food-app

赤ちゃんの離乳食を記録・管理する PWA。カレンダー記録・月齢別食材ガイド・アレルギー管理・写真記録。

## スタック / 運用

- Next.js (App Router) + TypeScript + Tailwind + shadcn/ui
- バックエンド: **PocketBase**（Railway 上の `baby-food-pb`、定義は `dev/pocketbase-railway/`）
  - ※README のセットアップ手順は旧 Supabase 時代の記述が残っており実態と異なる
- コレクション定義: `pocketbase-collections.json` / クライアントは `pocketbase` npm パッケージ
- メール送信: Resend
- デプロイ: フロント= Vercel、DB= Railway。環境変数 `NEXT_PUBLIC_POCKETBASE_URL`

## コマンド

- `npm run dev` / `npm run build` / `npm run lint`
- アイコン再生成: `node generate-icons.mjs`（要 sharp）

## 注意

- `.env.local` は読まない・コミットしない
- PocketBase のスキーマ変更は `pocketbase-collections.json` にも反映する
