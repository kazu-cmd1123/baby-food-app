'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarDays, BookOpen, Home, Settings } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'ホーム', icon: Home },
  { href: '/dashboard/calendar', label: 'カレンダー', icon: CalendarDays },
  { href: '/dashboard/foods', label: '食材', icon: BookOpen },
  { href: '/dashboard/settings', label: '設定', icon: Settings },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40">
      <div className="max-w-lg mx-auto flex">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center py-2 gap-0.5 text-xs transition-colors ${
                active ? 'text-orange-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.5} />
              <span className={active ? 'font-semibold' : ''}>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
