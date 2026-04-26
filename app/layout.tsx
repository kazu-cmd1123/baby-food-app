import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: '離乳食記録アプリ',
  description: '赤ちゃんの離乳食を記録・管理するアプリ',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={notoSansJP.className}>
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
