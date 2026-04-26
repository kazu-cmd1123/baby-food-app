'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, getDay } from 'date-fns'
import { ja } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getClient } from '@/lib/pocketbase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Props {
  initialRecords: { date: string; meal_time: string }[]
  children: { id: string; name: string }[]
}

const MEAL_DOTS: Record<string, string> = {
  morning: 'bg-yellow-400',
  noon: 'bg-green-400',
  evening: 'bg-blue-400',
  snack: 'bg-pink-400',
}

export function CalendarView({ initialRecords, children }: Props) {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [records, setRecords] = useState(initialRecords)
  const [loading, setLoading] = useState(false)

  const recordsByDate = records.reduce((acc, r) => {
    if (!acc[r.date]) acc[r.date] = []
    acc[r.date].push(r.meal_time)
    return acc
  }, {} as Record<string, string[]>)

  const fetchRecords = useCallback(async (date: Date) => {
    if (children.length === 0) return
    setLoading(true)
    const pb = getClient()
    const start = format(startOfMonth(date), 'yyyy-MM-dd')
    const end = format(endOfMonth(date), 'yyyy-MM-dd')
    const childFilter = children.map(c => `child = "${c.id}"`).join(' || ')
    const data = await pb.collection('meal_records').getFullList({
      filter: `(${childFilter}) && date >= "${start}" && date <= "${end}"`,
      fields: 'date,meal_time',
    }).catch(() => [])
    setRecords(data as { date: string; meal_time: string }[])
    setLoading(false)
  }, [children])

  function changeMonth(dir: -1 | 1) {
    const next = new Date(currentDate.getFullYear(), currentDate.getMonth() + dir, 1)
    setCurrentDate(next)
    fetchRecords(next)
  }

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startDow = getDay(monthStart)

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-4">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={() => changeMonth(-1)}>
              <ChevronLeft size={20} />
            </Button>
            <h2 className="font-bold text-lg">
              {format(currentDate, 'yyyy年M月', { locale: ja })}
            </h2>
            <Button variant="ghost" size="icon" onClick={() => changeMonth(1)}>
              <ChevronRight size={20} />
            </Button>
          </div>

          {/* Day of week headers */}
          <div className="grid grid-cols-7 mb-1">
            {['日', '月', '火', '水', '木', '金', '土'].map((d, i) => (
              <div key={d} className={`text-center text-xs font-medium py-1 ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'}`}>
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: startDow }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {days.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd')
              const dayRecords = recordsByDate[dateStr] || []
              const dow = getDay(day)
              const today = isToday(day)
              return (
                <button
                  key={dateStr}
                  onClick={() => router.push(`/dashboard/records?date=${dateStr}`)}
                  className={`
                    relative flex flex-col items-center py-1 rounded-lg text-sm transition-colors hover:bg-orange-50
                    ${!isSameMonth(day, currentDate) ? 'opacity-30' : ''}
                    ${today ? 'bg-orange-100 font-bold' : ''}
                    ${dow === 0 ? 'text-red-500' : dow === 6 ? 'text-blue-500' : 'text-gray-800'}
                  `}
                >
                  <span className={today ? 'w-7 h-7 flex items-center justify-center rounded-full bg-orange-500 text-white text-xs' : 'text-sm'}>
                    {format(day, 'd')}
                  </span>
                  {dayRecords.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                      {[...new Set(dayRecords)].map(mt => (
                        <span key={mt} className={`w-1.5 h-1.5 rounded-full ${MEAL_DOTS[mt]}`} />
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {loading && <p className="text-center text-xs text-gray-400 mt-2">読み込み中...</p>}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="pt-3 pb-3">
          <div className="flex flex-wrap gap-3 text-xs text-gray-600">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400" />朝食</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400" />昼食</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" />夕食</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pink-400" />おやつ</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">日付をタップすると記録できます</p>
        </CardContent>
      </Card>
    </div>
  )
}
