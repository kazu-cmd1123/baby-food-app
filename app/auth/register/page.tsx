'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { getClient } from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) {
      toast.error('パスワードは6文字以上で設定してください')
      return
    }
    setLoading(true)
    try {
      const pb = getClient()
      await pb.collection('users').create({ email, password, passwordConfirm: password })
      await pb.collection('users').authWithPassword(email, password)
      document.cookie = pb.authStore.exportToCookie({ httpOnly: false, sameSite: 'Lax' })
      toast.success('登録が完了しました！')
      router.push('/dashboard')
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '登録に失敗しました'
      toast.error(msg)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-5xl mb-2">🍼</div>
          <CardTitle className="text-2xl">新規登録</CardTitle>
          <CardDescription>アカウントを作成してください</CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
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
            <div className="space-y-2">
              <Label htmlFor="password">パスワード（6文字以上）</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={loading}>
              {loading ? '登録中...' : '新規登録'}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              すでにアカウントをお持ちの方は{' '}
              <Link href="/auth/login" className="text-orange-600 hover:underline font-medium">
                ログイン
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
