import { NextRequest, NextResponse } from 'next/server'
import PocketBase from 'pocketbase'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  // IPアドレスでレート制限（1時間に5回まで）
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'
  const key = `register:${ip}`
  const limit = rateLimit(key, { limit: 5, windowMs: 60 * 60 * 1000 })

  if (!limit.success) {
    return NextResponse.json(
      { error: '登録試行が多すぎます。しばらく時間をおいてからお試しください。' },
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
  if (email.length > 200) {
    return NextResponse.json({ error: 'メールアドレスが長すぎます。' }, { status: 400 })
  }

  // パスワード強度チェック（8文字以上）
  if (password.length < 8) {
    return NextResponse.json({ error: 'パスワードは8文字以上で設定してください。' }, { status: 400 })
  }
  if (password.length > 200) {
    return NextResponse.json({ error: 'パスワードが長すぎます。' }, { status: 400 })
  }

  // 簡易メール形式チェック
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'メールアドレスの形式が正しくありません。' }, { status: 400 })
  }

  try {
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL)
    pb.autoCancellation(false)
    await pb.collection('users').create({
      email,
      password,
      passwordConfirm: password,
    })

    // 登録後に自動ログイン
    const authData = await pb.collection('users').authWithPassword(email, password)
    const cookieValue = pb.authStore.exportToCookie({ httpOnly: false, sameSite: 'Lax', secure: true })
    const response = NextResponse.json({ success: true, record: { id: authData.record.id } })
    response.headers.set('Set-Cookie', cookieValue)
    return response
  } catch (err: unknown) {
    // PocketBaseのエラーから詳細を隠す
    const msg = err instanceof Error ? err.message : ''
    if (msg.includes('email')) {
      return NextResponse.json({ error: 'このメールアドレスは既に登録されています。' }, { status: 409 })
    }
    return NextResponse.json({ error: '登録に失敗しました。しばらくしてからお試しください。' }, { status: 500 })
  }
}
