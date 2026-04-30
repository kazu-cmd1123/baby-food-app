// シンプルなメモリベースのレート制限
// Vercelのサーバーレス環境向け（リクエストごとにリセットされる可能性があるため
// 厳密なカウントではなく、短時間の連続攻撃を防ぐ用途）

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

interface RateLimitOptions {
  limit: number      // 最大試行回数
  windowMs: number   // 時間窓（ミリ秒）
}

export function rateLimit(key: string, options: RateLimitOptions): { success: boolean; remaining: number } {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + options.windowMs })
    return { success: true, remaining: options.limit - 1 }
  }

  if (entry.count >= options.limit) {
    return { success: false, remaining: 0 }
  }

  entry.count++
  return { success: true, remaining: options.limit - entry.count }
}
