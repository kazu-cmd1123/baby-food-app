import { NextRequest, NextResponse } from 'next/server'
import PocketBase from 'pocketbase'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'
  const key = `reset:${ip}`
  const limit = rateLimit(key, { limit: 3, windowMs: 60 * 60 * 1000 })

  if (!limit.success) {
    return NextResponse.json(
      { error: 'リクエストが多すぎます。しばらく時間をおいてからお試しください。' },
      { status: 429 }
    )
  }

  let body: { email?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: '不正なリクエストです。' }, { status: 400 })
  }

  const { email } = body
  if (!email || typeof email !== 'string' || email.length > 200) {
    return NextResponse.json({ error: 'メールアドレスを入力してください。' }, { status: 400 })
  }

  try {
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL)
    pb.autoCancellation(false)
    await pb.collection('users').requestPasswordReset(email)
  } catch {
    // エラーでも成功と同じレスポンスを返す（メールアドレスの存在を漏らさない）
  }

  // メールが存在しない場合も同じメッセージを返す（セキュリティのため）
  return NextResponse.json({
    success: true,
    message: 'パスワードリセットのメールを送信しました（登録済みの場合）。',
  })
}
