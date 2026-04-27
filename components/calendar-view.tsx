'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, getDay } from 'date-fns'
import { ja } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Clock, Pencil, ShoppingCart } from 'lucide-react'
import { getClient } from '@/lib/pocketbase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface MealRecord {
  id: string
  date: string
  meal_time: string
  time: string
  foods: { food_name: string; amount: string; unit: string }[]
  notes: string
}

interface PlannedFood {
  id: string
  food_name: string
  target_date: string
  done: boolean
}

interface Props {
  initialRecords: { date: string; meal_time: string }[]
  initialPlans: PlannedFood[]
  children: { id: string; name: string }[]
}

const MEAL_DOTS: Record<string, string> = {
  morning: 'bg-yellow-400',
  noon: 'bg-green-400',
  evening: 'bg-blue-400',
  snack: 'bg-pink-400',
}

const MEAL_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  morning: { label: '朝食', emoji: '🌅', color: 'bg-yellow-50 border-yellow-200' },
  noon:    { label: '昼食', emoji: '☀️', color: 'bg-green-50 border-green-200' },
  evening: { label: '夕食', emoji: '🌙', color: 'bg-blue-50 border-blue-200' },
  snack:   { label: 'おやつ', emoji: '🍪', color: 'bg-pink-50 border-pink-200' },
}

export function CalendarView({ initialRecords, initialPlans, children }: Props) {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [records, setRecords] = useState(initialRecords)
  const [plans, setPlans] = useState<PlannedFood[]>(initialPlans)
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(
    format(new Date(), 'yyyy-MM-dd')
  )
  const [dayRecordsDetail, setDayRecordsDetail] = useState<MealRecord[]>([])
  const [detailLoading, setDetailLoading] = useState(false)

  const recordsByDate = records.reduce((acc, r) => {
    if (!acc[r.date]) acc[r.date] = []
    acc[r.date].push(r.meal_time)
    return acc
  }, {} as Record<string, string[]>)

  // planned foods indexed by target_date (未完了のみ)
  const plansByDate = plans.reduce((acc, p) => {
    if (!p.target_date || p.done) return acc
    if (!acc[p.target_date]) acc[p.target_date] = []
    acc[p.target_date].push(p)
    return acc
  }, {} as Record<string, PlannedFood[]>)

  const fetchMonthRecords = useCallback(async (date: Date) => {
    if (children.length === 0) return
    setLoading(true)
    const pb = getClient()
    const start = format(startOfMonth(date), 'yyyy-MM-dd')
    const end = format(endOfMonth(date), 'yyyy-MM-dd')
    const childFilter = children.map(c => `child = "${c.id}"`).join(' || ')

    const [data, planData] = await Promise.all([
      pb.collection('meal_records').getFullList({
        filter: `(${childFilter}) && date >= "${start}" && date <= "${end}"`,
        fields: 'date,meal_time',
      }).catch(() => []),
      pb.collection('planned_foods').getFullList({
        filter: childFilter,
        fields: 'id,food_name,target_date,done',
      }).catch(() => []),
    ])

    setRecords(data as { date: string; meal_time: string }[])
    setPlans(planData as PlannedFood[])
    setLoading(false)
  }, [children])

  const fetchDayDetail = useCallback(async (dateStr: string) => {
    if (children.length === 0) return
    setDetailLoading(true)
    const pb = getClient()
    const childFilter = children.map(c => `child = "${c.id}"`).join(' || ')
    const data = await pb.collection('meal_records').getFullList({
      filter: `(${childFilter}) && date = "${dateStr}"`,
      fields: 'id,date,meal_time,time,foods,notes',
      sort: 'meal_time',
    }).catch(() => [])
    setDayRecordsDetail(data as unknown as MealRecord[])
    setDetailLoading(false)
  }, [children])

  function changeMonth(dir: -1 | 1) {
    const next = new Date(currentDate.getFullYear(), currentDate.getMonth() + dir, 1)
    setCurrentDate(next)
    fetchMonthRecords(next)
  }

  function selectDate(dateStr: string) {
    if (selectedDate === dateStr) {
      setSelectedDate(null)
      setDayRecordsDetail([])
    } else {
      setSelectedDate(dateStr)
      fetchDayDetail(dateStr)
    }
  }

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startDow = getDay(monthStart)

  const selectedDateParsed = selectedDate ? new Date(selectedDate + 'T00:00:00') : null
  const selectedDayPlans = selectedDate ? (plansByDate[selectedDate] || []) : []

  return (
    <div className="space-y-3">
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
              const dayPlans = plansByDate[dateStr] || []
              const dow = getDay(day)
              const todayFlag = isToday(day)
              const selected = selectedDate === dateStr
              return (
                <button
                  key={dateStr}
                  onClick={() => selectDate(dateStr)}
                  className={`
                    relative flex flex-col items-center py-1 rounded-lg text-sm transition-colors
                    ${!isSameMonth(day, currentDate) ? 'opacity-30' : ''}
                    ${selected ? 'bg-orange-200 ring-2 ring-orange-400' : todayFlag ? 'bg-orange-100' : 'hover:bg-orange-50'}
                    ${dow === 0 ? 'text-red-500' : dow === 6 ? 'text-blue-500' : 'text-gray-800'}
                  `}
                >
                  <span className={todayFlag && !selected
                    ? 'w-7 h-7 flex items-center justify-center rounded-full bg-orange-500 text-white text-xs'
                    : 'text-sm font-medium'
                  }>
                    {format(day, 'd')}
                  </span>
                  <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center min-h-[8px]">
                    {[...new Set(dayRecords)].map(mt => (
                      <span key={mt} className={`w-1.5 h-1.5 rounded-full ${MEAL_DOTS[mt] || 'bg-gray-300'}`} />
                    ))}
                    {dayPlans.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {loading && <p className="text-center text-xs text-gray-400 mt-2">読み込み中...</p>}
        </CardContent>
      </Card>

      {/* 選択した日の詳細 */}
      {selectedDate && selectedDateParsed && (
        <Card className="border-orange-200">
          <CardContent className="pt-3 pb-3">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-sm text-gray-800">
                {format(selectedDateParsed, 'M月d日(E)', { locale: ja })}の食事
              </p>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs border-orange-300 text-orange-700 hover:bg-orange-50"
                onClick={() => router.push(`/dashboard/records?date=${selectedDate}`)}
              >
                <Pencil size={12} className="mr-1" />記録する
              </Button>
            </div>

            {detailLoading ? (
              <p className="text-xs text-gray-400 text-center py-2">読み込み中...</p>
            ) : (
              <>
                {dayRecordsDetail.length === 0 && selectedDayPlans.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-3">記録がありません</p>
                ) : (
                  <div className="space-y-2">
                    {dayRecordsDetail.map(record => {
                      const meta = MEAL_LABELS[record.meal_time]
                      return (
                        <div key={record.id} className={`rounded-lg border p-2.5 ${meta?.color || 'bg-gray-50 border-gray-200'}`}>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-base">{meta?.emoji}</span>
                            <span className="text-xs font-semibold text-gray-700">{meta?.label || record.meal_time}</span>
                            {record.time && (
                              <Badge variant="outline" className="text-xs py-0 px-1.5 h-4 text-gray-500">
                                <Clock size={9} className="mr-0.5" />{record.time}
                              </Badge>
                            )}
                          </div>
                          {Array.isArray(record.foods) && record.foods.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {record.foods.map((f, i) => (
                                <span key={i} className="text-xs bg-white/80 border rounded px-1.5 py-0.5 text-gray-700">
                                  {f.food_name}{f.amount ? ` ${f.amount}${f.unit}` : ''}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400">食材の記録なし</p>
                          )}
                          {record.notes && (
                            <p className="text-xs text-gray-500 mt-1 italic">{record.notes}</p>
                          )}
                        </div>
                      )
                    })}

                    {/* 食材プラン */}
                    {selectedDayPlans.length > 0 && (
                      <div className="rounded-lg border border-purple-200 bg-purple-50 p-2.5">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <ShoppingCart size={12} className="text-purple-500" />
                          <span className="text-xs font-semibold text-purple-700">食材プラン</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {selectedDayPlans.map(p => (
                            <span key={p.id} className="text-xs bg-white border border-purple-200 rounded px-1.5 py-0.5 text-purple-700">
                              {p.food_name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Card>
        <CardContent className="pt-3 pb-3">
          <div className="flex flex-wrap gap-3 text-xs text-gray-600">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400" />朝食</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400" />昼食</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" />夕食</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pink-400" />おやつ</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400" />食材プラン</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">日付をタップすると詳細が表示されます</p>
        </CardContent>
      </Card>
    </div>
  )
}
