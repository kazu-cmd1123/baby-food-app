import { NextRequest, NextResponse } from 'next/server'
import PocketBase from 'pocketbase'
import { verifyResetToken } from '@/lib/reset-token'

export async function POST(req: NextRequest) {
  let body: { token?: string; password?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: '不正なリクエストです。' }, { status: 400 })
  }

  const { token, password } = body

  if (!token || !password) {
    return NextResponse.json({ error: 'トークンとパスワードを入力してください。' }, { status: 400 })
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'パスワードは8文字以上で設定してください。' }, { status: 400 })
  }

  // JWTトークン検証
  const payload = await verifyResetToken(token)
  if (!payload) {
    return NextResponse.json(
      { error: 'リセットリンクが無効または期限切れです。再度お試しください。' },
      { status: 400 }
    )
  }

  try {
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL)
    pb.autoCancellation(false)

    // Admin認証（PocketBase v0.22系の旧エンドポイントを使用）
    const adminRes = await fetch(`${process.env.NEXT_PUBLIC_POCKETBASE_URL}/api/admins/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: process.env.PB_ADMIN_EMAIL, password: process.env.PB_ADMIN_PASSWORD }),
    })
    if (!adminRes.ok) throw new Error('Admin auth failed')
    const { token: adminToken } = await adminRes.json()
    pb.authStore.save(adminToken, null)

    await pb.collection('users').update(payload.userId, {
      password,
      passwordConfirm: password,
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'パスワードの更新に失敗しました。しばらくしてからお試しください。' },
      { status: 500 }
    )
  }
}
