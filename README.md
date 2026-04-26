# 離乳食記録アプリ

赤ちゃんの離乳食を管理・記録するWebアプリです。

## 機能

- **カレンダー表示** — 食事記録をカレンダーで一覧確認
- **月齢別食材ガイド** — 5〜6ヶ月・7〜8ヶ月・9〜11ヶ月・12〜18ヶ月別の食材・調理法・栄養素・注意事項
- **写真記録** — 食事の写真をアップロード
- **食べた量の記録** — g・ml・個など単位付きで記録
- **食事反応記録** — よく食べた・まあまあ・食べなかった・アレルギー反応
- **アレルギー管理** — アレルギー食材と症状の重さを記録
- **メールアドレス認証** — Supabase Auth によるセキュアなログイン
- **子供の名前・誕生日管理** — 月齢を自動計算して適切な食材を表示

## セットアップ

### 1. Supabaseプロジェクトの作成

1. https://supabase.com でプロジェクトを作成
2. SQL Editor で supabase-schema.sql の内容を実行
3. Project Settings > API から URL と anon key を取得

### 2. 環境変数の設定

.env.local を編集：

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 3. 起動

```bash
npm install
npm run dev
```

## 技術スタック

- Next.js 14 (App Router)
- Supabase (Auth + PostgreSQL + Storage)
- Tailwind CSS + shadcn/ui
- TypeScript
