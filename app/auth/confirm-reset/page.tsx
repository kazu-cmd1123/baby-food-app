'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

function ConfirmResetForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      toast.error('パスワードが一致しません。')
      return
    }
    if (password.length < 8) {
      toast.error('パスワードは8文字以上で設定してください。')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/confirm-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'エラーが発生しました。')
        return
      }
      setDone(true)
      setTimeout(() => router.push('/auth/login'), 3000)
    } catch {
      toast.error('通信エラーが発生しました。')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <CardContent className="text-center py-6">
        <p className="text-red-500 font-medium">無効なリンクです。</p>
        <Link href="/auth/reset-password" className="text-orange-600 hover:underline text-sm block mt-3">
          もう一度リセットを申請する
        </Link>
      </CardContent>
    )
  }

  if (done) {
    return (
      <CardContent className="text-center py-6 space-y-3">
        <p className="text-green-600 font-medium">✅ パスワードを変更しました！</p>
        <p className="text-sm text-gray-500">3秒後にログイン画面に移動します。</p>
      </CardContent>
    )
  }

  return (
    <form onSubmit={handleConfirm}>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">新しいパスワード（8文字以上）</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">パスワード（確認）</Label>
          <Input
            id="confirm"
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={loading}>
          {loading ? '変更中...' : 'パスワードを変更する'}
        </Button>
      </CardFooter>
    </form>
  )
}

export default function ConfirmResetPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-5xl mb-2">🔑</div>
          <CardTitle className="text-2xl">新しいパスワード設定</CardTitle>
          <CardDescription>新しいパスワードを入力してください</CardDescription>
        </CardHeader>
        <Suspense fallback={<CardContent><p className="text-center text-gray-400">読み込み中...</p></CardContent>}>
          <ConfirmResetForm />
        </Suspense>
      </Card>
    </div>
  )
}
