'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { toast } from 'sonner'
import { getClient } from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, CheckCircle2, Circle, CalendarDays, ShoppingCart } from 'lucide-react'

interface PlannedFood {
  id: string
  child: string
  food_name: string
  target_date: string
  notes: string
  done: boolean
}

interface Props {
  childId: string
  initialPlans: PlannedFood[]
}

export function PlannedFoods({ childId, initialPlans }: Props) {
  const [plans, setPlans] = useState<PlannedFood[]>(initialPlans)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    food_name: '',
    target_date: '',
    notes: '',
  })
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'done'>('upcoming')

  const today = format(new Date(), 'yyyy-MM-dd')

  const filtered = plans.filter(p => {
    if (filter === 'upcoming') return !p.done
    if (filter === 'done') return p.done
    return true
  }).sort((a, b) => {
    // 未完了を先に、その中で日付順
    if (a.done !== b.done) return a.done ? 1 : -1
    if (a.target_date && b.target_date) return a.target_date.localeCompare(b.target_date)
    return 0
  })

  async function addPlan() {
    if (!form.food_name.trim()) {
      toast.error('食材名を入力してください')
      return
    }
    setSaving(true)
    const pb = getClient()
    try {
      const data = await pb.collection('planned_foods').create({
        child: childId,
        food_name: form.food_name.trim(),
        target_date: form.target_date,
        notes: form.notes,
        done: false,
      })
      setPlans(prev => [data as unknown as PlannedFood, ...prev])
      setForm({ food_name: '', target_date: '', notes: '' })
      setShowForm(false)
      toast.success('食材プランを追加しました')
    } catch {
      toast.error('追加に失敗しました')
    }
    setSaving(false)
  }

  async function toggleDone(plan: PlannedFood) {
    const pb = getClient()
    try {
      await pb.collection('planned_foods').update(plan.id, { done: !plan.done })
      setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, done: !p.done } : p))
    } catch {
      toast.error('更新に失敗しました')
    }
  }

  async function deletePlan(id: string) {
    const pb = getClient()
    try {
      await pb.collection('planned_foods').delete(id)
      setPlans(prev => prev.filter(p => p.id !== id))
    } catch {
      toast.error('削除に失敗しました')
    }
  }

  function getDateLabel(dateStr: string) {
    if (!dateStr) return null
    const diff = Math.ceil((new Date(dateStr).getTime() - new Date(today).getTime()) / 86400000)
    if (diff < 0) return { label: `${Math.abs(diff)}日前`, color: 'text-gray-400' }
    if (diff === 0) return { label: '今日', color: 'text-orange-600 font-semibold' }
    if (diff <= 3) return { label: `${diff}日後`, color: 'text-orange-500' }
    if (diff <= 7) return { label: `${diff}日後`, color: 'text-blue-500' }
    return {
      label: format(new Date(dateStr + 'T00:00:00'), 'M/d(E)', { locale: ja }),
      color: 'text-gray-500'
    }
  }

  const upcomingCount = plans.filter(p => !p.done).length

  return (
    <div className="space-y-3">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart size={16} className="text-orange-500" />
          <p className="text-sm font-medium text-gray-700">食材プラン</p>
          {upcomingCount > 0 && (
            <Badge className="text-xs bg-orange-100 text-orange-700">{upcomingCount}件</Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-orange-600"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={14} className="mr-0.5" />追加
        </Button>
      </div>

      {/* 追加フォーム */}
      {showForm && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-3 pb-3 space-y-2">
            <div>
              <Label className="text-xs">食材名 *</Label>
              <Input
                placeholder="例：小松菜"
                value={form.food_name}
                onChange={e => setForm(p => ({ ...p, food_name: e.target.value }))}
                className="mt-1 h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">開始予定日（任意）</Label>
              <input
                type="date"
                value={form.target_date}
                onChange={e => setForm(p => ({ ...p, target_date: e.target.value }))}
                className="mt-1 w-full h-8 text-sm border rounded-md px-2 bg-white"
              />
            </div>
            <div>
              <Label className="text-xs">メモ（購入場所・調理メモなど）</Label>
              <Input
                placeholder="例：スーパーで購入予定。すりつぶして10倍粥に混ぜる"
                value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                className="mt-1 h-8 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="h-7 text-xs bg-orange-500 hover:bg-orange-600" onClick={addPlan} disabled={saving}>
                {saving ? '追加中...' : '追加する'}
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowForm(false)}>
                キャンセル
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* フィルター */}
      <div className="flex gap-1">
        {(['upcoming', 'all', 'done'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${
              filter === f ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'upcoming' ? '予定中' : f === 'done' ? '済み' : 'すべて'}
          </button>
        ))}
      </div>

      {/* プランリスト */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="pt-4 pb-4 text-center text-sm text-gray-400">
            {filter === 'upcoming' ? '予定している食材はありません' : 'プランがありません'}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(plan => {
            const dateInfo = plan.target_date ? getDateLabel(plan.target_date) : null
            return (
              <Card key={plan.id} className={plan.done ? 'opacity-60' : ''}>
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleDone(plan)}
                      className="mt-0.5 shrink-0 text-orange-500 hover:text-orange-600"
                    >
                      {plan.done
                        ? <CheckCircle2 size={18} className="text-green-500" />
                        : <Circle size={18} />
                      }
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-medium ${plan.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                          {plan.food_name}
                        </span>
                        {dateInfo && (
                          <span className={`text-xs flex items-center gap-0.5 ${dateInfo.color}`}>
                            <CalendarDays size={10} />{dateInfo.label}
                          </span>
                        )}
                      </div>
                      {plan.notes && (
                        <p className="text-xs text-gray-500 mt-0.5">{plan.notes}</p>
                      )}
                    </div>
                    <button
                      onClick={() => deletePlan(plan.id)}
                      className="text-gray-300 hover:text-red-400 shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
