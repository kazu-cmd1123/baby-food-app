'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart2 } from 'lucide-react'

interface RecordedFood {
  food_name: string
  amount: string
  unit: string
  reaction: string | null
}

interface MealRecord {
  meal_time: string
  foods: RecordedFood[]
}

const MEAL_LABELS: Record<string, string> = {
  morning: '朝食',
  noon: '昼食',
  evening: '夕食',
  snack: 'おやつ',
}

const REACTION_EMOJI: Record<string, string> = {
  good: '😋',
  ok: '😐',
  bad: '😞',
  allergy: '⚠️',
}

interface Props {
  records: MealRecord[]
}

export function DailySummary({ records }: Props) {
  const allFoods = useMemo(() => {
    const result: { food_name: string; amount: string; unit: string; reaction: string | null; meal: string }[] = []
    records.forEach(r => {
      if (!Array.isArray(r.foods)) return
      r.foods.forEach(f => {
        result.push({ ...f, meal: r.meal_time })
      })
    })
    return result
  }, [records])

  // 食材ごとに合計を集計（同じ単位のみ合算）
  const totals = useMemo(() => {
    const map: Record<string, { amounts: { value: number; unit: string }[]; reactions: string[] }> = {}
    allFoods.forEach(f => {
      if (!map[f.food_name]) map[f.food_name] = { amounts: [], reactions: [] }
      const num = parseFloat(f.amount)
      if (f.amount && !isNaN(num)) {
        const existing = map[f.food_name].amounts.find(a => a.unit === f.unit)
        if (existing) {
          existing.value += num
        } else {
          map[f.food_name].amounts.push({ value: num, unit: f.unit })
        }
      }
      if (f.reaction) map[f.food_name].reactions.push(f.reaction)
    })
    return map
  }, [allFoods])

  const totalMeals = records.length
  const totalFoodTypes = Object.keys(totals).length

  if (totalMeals === 0) return null

  return (
    <Card className="border-orange-100 bg-orange-50/50">
      <CardHeader className="pb-2 pt-3">
        <CardTitle className="text-sm flex items-center gap-2 text-orange-800">
          <BarChart2 size={15} />
          今日の集計
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 pb-3 space-y-3">
        {/* サマリー数字 */}
        <div className="flex gap-4 text-center">
          <div className="flex-1 bg-white rounded-lg py-2">
            <p className="text-xl font-bold text-orange-600">{totalMeals}</p>
            <p className="text-xs text-gray-500">食事回数</p>
          </div>
          <div className="flex-1 bg-white rounded-lg py-2">
            <p className="text-xl font-bold text-orange-600">{totalFoodTypes}</p>
            <p className="text-xs text-gray-500">食材の種類</p>
          </div>
        </div>

        {/* 食材別集計 */}
        {Object.entries(totals).length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-600 mb-1">食材別の合計</p>
            {Object.entries(totals).map(([name, data]) => (
              <div key={name} className="flex items-center justify-between bg-white rounded-lg px-3 py-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-700">{name}</span>
                  {data.reactions.length > 0 && (
                    <span className="text-xs">{REACTION_EMOJI[data.reactions[data.reactions.length - 1]] || ''}</span>
                  )}
                </div>
                <div className="flex gap-2 text-xs text-gray-500">
                  {data.amounts.length > 0
                    ? data.amounts.map((a, i) => (
                        <span key={i} className="font-semibold text-orange-600">
                          {Number.isInteger(a.value) ? a.value : a.value.toFixed(1)}{a.unit}
                        </span>
                      ))
                    : <span className="text-gray-300">量未記録</span>
                  }
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 食事別 */}
        <div className="text-xs text-gray-500 flex flex-wrap gap-2">
          {records.map((r, i) => (
            <span key={i} className="bg-white border rounded px-2 py-0.5">
              {MEAL_LABELS[r.meal_time]}：{Array.isArray(r.foods) ? r.foods.length : 0}品
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
