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

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const pb = getClient()
      await pb.collection('users').authWithPassword(email, password)
      document.cookie = pb.authStore.exportToCookie({ httpOnly: false, sameSite: 'Lax' })
      router.push('/dashboard')
      router.refresh()
    } catch {
      toast.error('ログインに失敗しました。メールアドレスとパスワードを確認してください。')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-5xl mb-2">🍼</div>
          <CardTitle className="text-2xl">離乳食記録アプリ</CardTitle>
          <CardDescription>ログインしてください</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
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
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={loading}>
              {loading ? 'ログイン中...' : 'ログイン'}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              アカウントをお持ちでない方は{' '}
              <Link href="/auth/register" className="text-orange-600 hover:underline font-medium">
                新規登録
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
