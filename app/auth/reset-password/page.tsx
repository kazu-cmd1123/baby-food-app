'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'エラーが発生しました。')
        return
      }
      setSent(true)
    } catch {
      toast.error('通信エラーが発生しました。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-5xl mb-2">🔑</div>
          <CardTitle className="text-2xl">パスワードリセット</CardTitle>
          <CardDescription>登録済みのメールアドレスを入力してください</CardDescription>
        </CardHeader>
        {sent ? (
          <CardContent className="text-center space-y-4 py-6">
            <p className="text-green-600 font-medium">✅ メールを送信しました</p>
            <p className="text-sm text-gray-500">
              登録済みのメールアドレスの場合、パスワードリセット用のリンクが届きます。
              メールを確認してください。
            </p>
            <Link href="/auth/login" className="text-orange-600 hover:underline text-sm">
              ログインページへ戻る
            </Link>
          </CardContent>
        ) : (
          <form onSubmit={handleReset}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={loading}>
                {loading ? '送信中...' : 'リセットメールを送信'}
              </Button>
              <Link href="/auth/login" className="text-sm text-orange-600 hover:underline text-center">
                ログインページへ戻る
              </Link>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  )
}
