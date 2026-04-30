import { NextRequest, NextResponse } from 'next/server'
import PocketBase from 'pocketbase'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  // IPアドレスでレート制限（10分間に10回まで）
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'
  const key = `login:${ip}`
  const limit = rateLimit(key, { limit: 10, windowMs: 10 * 60 * 1000 })

  if (!limit.success) {
    return NextResponse.json(
      { error: 'ログイン試行が多すぎます。しばらく時間をおいてからお試しください。' },
      { status: 429 }
    )
  }

  let body: { email?: string; password?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: '不正なリクエストです。' }, { status: 400 })
  }

  const { email, password } = body

  // 入力バリデーション
  if (!email || !password) {
    return NextResponse.json({ error: 'メールアドレスとパスワードを入力してください。' }, { status: 400 })
  }
  if (typeof email !== 'string' || typeof password !== 'string') {
    return NextResponse.json({ error: '不正な入力です。' }, { status: 400 })
  }
  if (email.length > 200 || password.length > 200) {
    return NextResponse.json({ error: '入力値が長すぎます。' }, { status: 400 })
  }

  try {
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL)
    pb.autoCancellation(false)
    const authData = await pb.collection('users').authWithPassword(email, password)

    // セキュアなクッキーを設定
    const cookieValue = pb.authStore.exportToCookie({ httpOnly: false, sameSite: 'Lax', secure: true })
    const response = NextResponse.json({ success: true, record: { id: authData.record.id } })
    response.headers.set('Set-Cookie', cookieValue)
    return response
  } catch {
    // 詳細なエラーを隠す（ユーザー存在の有無を漏らさない）
    return NextResponse.json(
      { error: 'メールアドレスまたはパスワードが正しくありません。' },
      { status: 401 }
    )
  }
}
