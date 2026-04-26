import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/pocketbase/server'
import { MobileNav } from '@/components/mobile-nav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pb = await createServerClient()
  if (!pb.authStore.isValid) redirect('/auth/login')

  return (
    <div className="min-h-screen bg-orange-50 pb-20">
      <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-2">
          <span className="text-2xl">🍼</span>
          <h1 className="font-bold text-orange-700 text-lg">離乳食記録</h1>
        </div>
      </header>
      <main className="max-w-lg mx-auto px-4 py-4">
        {children}
      </main>
      <MobileNav />
    </div>
  )
}
