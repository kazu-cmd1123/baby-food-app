import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import PocketBase from 'pocketbase'
import { rateLimit } from '@/lib/rate-limit'
import { createResetToken } from '@/lib/reset-token'

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
    // PocketBaseでユーザーを検索
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

    // ユーザー検索
    const users = await pb.collection('users').getFullList({
      filter: `email = "${email}"`,
    })

    if (users.length === 0) {
      // ユーザーが存在しない場合も成功を返す（セキュリティのため）
      return NextResponse.json({ success: true })
    }

    const user = users[0]

    // JWTトークン生成
    const token = await createResetToken(user.id, email)

    // リセットURL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://baby-food-app-three.vercel.app'
    const resetUrl = `${appUrl}/auth/confirm-reset?token=${token}`

    // Resend HTTP APIでメール送信
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: '離乳食記録アプリ <onboarding@resend.dev>',
      to: email,
      subject: 'パスワードリセットのご案内',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #ea580c;">🍼 離乳食記録アプリ</h2>
          <p>パスワードリセットのリクエストを受け付けました。</p>
          <p>以下のボタンをクリックして、新しいパスワードを設定してください。</p>
          <p style="margin: 24px 0;">
            <a href="${resetUrl}"
               style="background-color: #ea580c; color: white; padding: 12px 24px;
                      text-decoration: none; border-radius: 8px; font-weight: bold;">
              パスワードをリセットする
            </a>
          </p>
          <p style="color: #6b7280; font-size: 14px;">
            このリンクは1時間有効です。<br>
            心当たりがない場合は、このメールを無視してください。
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
          <p style="color: #9ca3af; font-size: 12px;">離乳食記録アプリ</p>
        </div>
      `,
    })
  } catch (err) {
    console.error('[reset-password] error:', err)
  }

  return NextResponse.json({ success: true })
}
