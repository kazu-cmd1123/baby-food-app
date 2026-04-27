'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp } from 'lucide-react'

interface FoodEntry {
  food_name: string
  amount: string
  unit: string
  reaction: string | null
}

interface MealRecord {
  date: string
  foods: FoodEntry[]
}

interface Props {
  records: MealRecord[]
}

const REACTION_EMOJI: Record<string, string> = {
  good: '😋',
  ok: '😐',
  bad: '😞',
  allergy: '⚠️',
}

export function FoodStats({ records }: Props) {
  const stats = useMemo(() => {
    const map: Record<string, {
      count: number
      amounts: Record<string, number>  // unit -> total
      reactions: Record<string, number>
      lastDate: string
    }> = {}

    records.forEach(r => {
      if (!Array.isArray(r.foods)) return
      r.foods.forEach(f => {
        if (!f.food_name) return
        if (!map[f.food_name]) {
          map[f.food_name] = { count: 0, amounts: {}, reactions: {}, lastDate: '' }
        }
        const entry = map[f.food_name]
        entry.count++
        if (r.date > entry.lastDate) entry.lastDate = r.date

        const num = parseFloat(f.amount)
        if (f.amount && !isNaN(num) && f.unit) {
          entry.amounts[f.unit] = (entry.amounts[f.unit] || 0) + num
        }
        if (f.reaction) {
          entry.reactions[f.reaction] = (entry.reactions[f.reaction] || 0) + 1
        }
      })
    })

    return Object.entries(map)
      .sort((a, b) => b[1].count - a[1].count)
      .map(([name, data]) => ({
        name,
        count: data.count,
        amounts: data.amounts,
        lastDate: data.lastDate,
        dominantReaction: Object.entries(data.reactions).sort((a, b) => b[1] - a[1])[0]?.[0] || null,
        hasAllergy: 'allergy' in data.reactions,
      }))
  }, [records])

  if (stats.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-sm text-gray-400">
          まだ食事記録がありません
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">全期間の食材別累計（{records.length}件の記録）</p>
        <Badge className="text-xs bg-orange-100 text-orange-700">{stats.length}種類</Badge>
      </div>

      <Card>
        <CardHeader className="pb-2 pt-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp size={14} className="text-orange-500" />よく食べた食材 TOP10
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-3 space-y-1.5">
          {stats.slice(0, 10).map((s, i) => (
            <div key={s.name} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${s.hasAllergy ? 'bg-red-50' : 'bg-gray-50'}`}>
              <span className="text-xs text-gray-400 w-5 text-right shrink-0">{i + 1}</span>
              <span className={`text-sm font-medium flex-1 ${s.hasAllergy ? 'text-red-700' : 'text-gray-800'}`}>
                {s.name}
              </span>
              {s.hasAllergy && <span className="text-xs">⚠️</span>}
              {s.dominantReaction && !s.hasAllergy && (
                <span className="text-xs">{REACTION_EMOJI[s.dominantReaction]}</span>
              )}
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-xs font-semibold text-orange-600">{s.count}回</span>
                {Object.entries(s.amounts).map(([unit, total]) => (
                  <span key={unit} className="text-xs text-gray-400">
                    計{Number.isInteger(total) ? total : total.toFixed(1)}{unit}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {stats.length > 10 && (
        <Card>
          <CardHeader className="pb-2 pt-3">
            <CardTitle className="text-sm text-gray-600">その他の食材</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-3">
            <div className="flex flex-wrap gap-1.5">
              {stats.slice(10).map(s => (
                <span key={s.name} className={`text-xs border rounded-full px-2 py-0.5 ${s.hasAllergy ? 'border-red-200 text-red-600' : 'border-gray-200 text-gray-600'}`}>
                  {s.hasAllergy && '⚠️ '}{s.name} {s.count}回
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
