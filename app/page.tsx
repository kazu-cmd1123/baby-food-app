import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/pocketbase/server'

export default async function Home() {
  const pb = await createServerClient()
  if (pb.authStore.isValid) {
    redirect('/dashboard')
  } else {
    redirect('/auth/login')
  }
}
