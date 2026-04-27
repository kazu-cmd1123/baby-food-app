'use client'

import { useState, useMemo } from 'react'
import { FOODS, AGE_STAGES, FOOD_CATEGORIES, getFoodsForAge, getFoodsForStage } from '@/lib/foods-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Search, AlertTriangle, Info, CheckCircle2, Plus, X } from 'lucide-react'
import { Food, FoodCategory } from '@/types'
import { FoodStats } from '@/components/food-stats'
import { PlannedFoods } from '@/components/planned-foods'
import { getClient } from '@/lib/pocketbase/client'
import { toast } from 'sonner'

interface MealRecord {
  date: string
  foods: { food_name: string; amount: string; unit: string; reaction: string | null }[]
}

interface CustomFood {
  id: string
  child: string
  name: string
  category: FoodCategory
  min_months: number
  preparation: string
  nutrition: string
  caution: string
  is_allergen: boolean
}

interface Props {
  ageMonths: number | null
  childName?: string
  childId?: string
  allRecords?: MealRecord[]
  initialPlans?: { id: string; child: string; food_name: string; target_date: string; notes: string; done: boolean }[]
  initialCustomFoods?: CustomFood[]
}

const CATEGORY_ICONS: Record<string, string> = {
  grain: '🌾',
  vegetable: '🥦',
  fruit: '🍎',
  protein: '🥚',
  dairy: '🥛',
  fish: '🐟',
  seasoning: '🧂',
}

const CATEGORY_OPTIONS: { id: FoodCategory; label: string }[] = [
  { id: 'grain', label: '穀類' },
  { id: 'vegetable', label: '野菜' },
  { id: 'fruit', label: '果物' },
  { id: 'protein', label: 'たんぱく質' },
  { id: 'dairy', label: '乳製品' },
  { id: 'fish', label: '魚介類' },
  { id: 'seasoning', label: '調味料' },
]

const BLANK_FORM = {
  name: '',
  category: 'vegetable' as FoodCategory,
  min_months: 5,
  preparation: '',
  nutrition: '',
  caution: '',
  is_allergen: false,
}

export function FoodsGuide({ ageMonths, childName, childId, allRecords = [], initialPlans = [], initialCustomFoods = [] }: Props) {
  const [mainTab, setMainTab] = useState<'guide' | 'stats' | 'plan'>('guide')
  const [activeTab, setActiveTab] = useState<'current' | '5-6' | '7-8' | '9-11' | '12-18'>('current')
  const [search, setSearch] = useState('')
  const [selectedFood, setSelectedFood] = useState<Food | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(BLANK_FORM)
  const [customFoods, setCustomFoods] = useState<CustomFood[]>(initialCustomFoods)

  // 過去に食べた食材名（回数付き）
  const eatenFoods = useMemo(() => {
    const map: Record<string, number> = {}
    allRecords.forEach(r => {
      if (!Array.isArray(r.foods)) return
      r.foods.forEach(f => {
        if (f.food_name) map[f.food_name] = (map[f.food_name] || 0) + 1
      })
    })
    return map
  }, [allRecords])

  // カスタム食材をFood型に変換
  const customFoodsAsFood = useMemo((): Food[] =>
    customFoods.map(cf => ({
      id: `custom-${cf.id}`,
      name: cf.name,
      category: cf.category,
      min_months: cf.min_months,
      max_months: null,
      preparation: cf.preparation,
      nutrition: cf.nutrition || null,
      caution: cf.caution || null,
      is_allergen: cf.is_allergen,
    })),
  [customFoods])

  const displayFoods = useMemo(() => {
    let foods: Food[] = []
    if (activeTab === 'current') {
      const base = ageMonths ? getFoodsForAge(ageMonths) : []
      // カスタム食材は月齢フィルタ適用
      const custom = customFoodsAsFood.filter(f => !ageMonths || f.min_months <= ageMonths)
      foods = [...base, ...custom]
    } else {
      const stageMin = parseInt(activeTab.split('-')[0])
      const base = getFoodsForStage(stageMin)
      const custom = customFoodsAsFood.filter(f => f.min_months >= stageMin)
      foods = [...base, ...custom]
    }
    if (search) {
      foods = foods.filter(f =>
        f.name.includes(search) ||
        f.preparation.includes(search) ||
        FOOD_CATEGORIES[f.category].includes(search)
      )
    }
    return foods
  }, [activeTab, ageMonths, search, customFoodsAsFood])

  const groupedFoods = useMemo(() => {
    return displayFoods.reduce((acc, food) => {
      if (!acc[food.category]) acc[food.category] = []
      acc[food.category].push(food)
      return acc
    }, {} as Record<string, Food[]>)
  }, [displayFoods])

  const tabs = [
    { id: 'current' as const, label: ageMonths ? `${childName || '現在'}(${ageMonths}ヶ月)` : '現在の月齢' },
    ...AGE_STAGES.map(s => ({ id: s.id as '5-6' | '7-8' | '9-11' | '12-18', label: s.label })),
  ]

  async function addCustomFood() {
    if (!form.name.trim()) {
      toast.error('食材名を入力してください')
      return
    }
    if (!childId) {
      toast.error('お子様を登録してください')
      return
    }
    setSaving(true)
    const pb = getClient()
    try {
      const data = await pb.collection('custom_foods').create({
        child: childId,
        name: form.name.trim(),
        category: form.category,
        min_months: form.min_months,
        preparation: form.preparation,
        nutrition: form.nutrition,
        caution: form.caution,
        is_allergen: form.is_allergen,
      })
      setCustomFoods(prev => [...prev, data as unknown as CustomFood])
      setForm(BLANK_FORM)
      setShowAddForm(false)
      toast.success('食材を追加しました')
    } catch {
      toast.error('追加に失敗しました')
    }
    setSaving(false)
  }

  async function deleteCustomFood(cfId: string) {
    const pb = getClient()
    try {
      await pb.collection('custom_foods').delete(cfId)
      setCustomFoods(prev => prev.filter(cf => cf.id !== cfId))
      toast.success('削除しました')
    } catch {
      toast.error('削除に失敗しました')
    }
  }

  return (
    <div className="space-y-3">
      {/* メインタブ */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {([
          { id: 'guide', label: '食材ガイド' },
          { id: 'stats', label: '摂取記録' },
          { id: 'plan', label: '食材プラン' },
        ] as const).map(t => (
          <button
            key={t.id}
            onClick={() => setMainTab(t.id)}
            className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors ${
              mainTab === t.id ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 摂取記録タブ */}
      {mainTab === 'stats' && <FoodStats records={allRecords} />}

      {/* 食材プランタブ */}
      {mainTab === 'plan' && childId && (
        <PlannedFoods childId={childId} initialPlans={initialPlans} />
      )}
      {mainTab === 'plan' && !childId && (
        <div className="text-center text-sm text-gray-400 py-8">
          お子様を登録するとプラン機能が使えます
        </div>
      )}

      {/* 食材ガイドタブ */}
      {mainTab === 'guide' && <>
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg text-gray-800">食材ガイド</h2>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs border-orange-300 text-orange-700 hover:bg-orange-50"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus size={13} className="mr-0.5" />食材追加
        </Button>
      </div>

      {/* 食材追加フォーム */}
      {showAddForm && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-3 pb-3 space-y-2">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold text-orange-800">オリジナル食材を追加</p>
              <button onClick={() => setShowAddForm(false)}><X size={16} className="text-gray-400" /></button>
            </div>

            <div>
              <Label className="text-xs">食材名 *</Label>
              <Input
                placeholder="例：アボカド"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="mt-1 h-8 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">カテゴリー</Label>
                <select
                  value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value as FoodCategory }))}
                  className="mt-1 w-full h-8 text-sm border rounded-md px-2 bg-white"
                >
                  {CATEGORY_OPTIONS.map(c => (
                    <option key={c.id} value={c.id}>{CATEGORY_ICONS[c.id]} {c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-xs">開始月齢（ヶ月）</Label>
                <Input
                  type="number"
                  min={5}
                  max={24}
                  value={form.min_months}
                  onChange={e => setForm(p => ({ ...p, min_months: Number(e.target.value) }))}
                  className="mt-1 h-8 text-sm"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">調理方法</Label>
              <Input
                placeholder="例：つぶしてペースト状に"
                value={form.preparation}
                onChange={e => setForm(p => ({ ...p, preparation: e.target.value }))}
                className="mt-1 h-8 text-sm"
              />
            </div>

            <div>
              <Label className="text-xs">栄養素（任意）</Label>
              <Input
                placeholder="例：ビタミンE・良質な脂質"
                value={form.nutrition}
                onChange={e => setForm(p => ({ ...p, nutrition: e.target.value }))}
                className="mt-1 h-8 text-sm"
              />
            </div>

            <div>
              <Label className="text-xs">注意事項（任意）</Label>
              <Input
                placeholder="例：脂質が多いので少量から"
                value={form.caution}
                onChange={e => setForm(p => ({ ...p, caution: e.target.value }))}
                className="mt-1 h-8 text-sm"
              />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_allergen}
                onChange={e => setForm(p => ({ ...p, is_allergen: e.target.checked }))}
                className="w-4 h-4"
              />
              <span className="text-gray-700">アレルゲンを含む</span>
            </label>

            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                className="h-7 text-xs bg-orange-500 hover:bg-orange-600"
                onClick={addCustomFood}
                disabled={saving}
              >
                {saving ? '追加中...' : '追加する'}
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowAddForm(false)}>
                キャンセル
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!ageMonths && activeTab === 'current' && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-3 text-sm text-orange-700">
            お子様の誕生日を設定すると、月齢に合った食材が表示されます。
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="overflow-x-auto -mx-4 px-4">
        <div className="flex gap-2 pb-1 w-max">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-600 border hover:bg-orange-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stage description */}
      {activeTab !== 'current' && (() => {
        const stage = AGE_STAGES.find(s => s.id === activeTab)
        return stage ? (
          <Card className={`border-0 ${stage.color.replace('text-', 'bg-').replace('-800', '-50')} `}>
            <CardContent className="pt-3 pb-3">
              <p className="text-xs font-semibold mb-1">{stage.label} — {stage.subtitle}</p>
              <p className="text-xs text-gray-600">{stage.description}</p>
            </CardContent>
          </Card>
        ) : null
      })()}

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="食材名で検索..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Food list */}
      {Object.entries(groupedFoods).length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-gray-400 text-sm">
            {search ? '該当する食材が見つかりません' : 'この月齢の食材データはありません'}
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedFoods).map(([category, foods]) => (
          <Card key={category}>
            <CardHeader className="pb-2 pt-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <span>{CATEGORY_ICONS[category]}</span>
                {FOOD_CATEGORIES[category]}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-3">
              <div className="space-y-2">
                {foods.map(food => {
                  const isCustom = food.id.startsWith('custom-')
                  const customId = isCustom ? food.id.replace('custom-', '') : null
                  const eatCount = eatenFoods[food.name] || 0
                  return (
                    <div key={food.id}>
                      <button
                        onClick={() => setSelectedFood(selectedFood?.id === food.id ? null : food)}
                        className="w-full text-left"
                      >
                        <div className={`rounded-lg border p-3 transition-colors ${
                          selectedFood?.id === food.id
                            ? 'border-orange-300 bg-orange-50'
                            : eatCount > 0
                            ? 'bg-green-50 border-green-200 hover:border-green-300'
                            : 'bg-gray-50 hover:bg-orange-50 hover:border-orange-200'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm">{food.name}</span>
                              {isCustom && (
                                <Badge className="text-xs bg-blue-100 text-blue-600 border-blue-200 py-0">
                                  オリジナル
                                </Badge>
                              )}
                              {eatCount > 0 && (
                                <Badge className="text-xs bg-green-100 text-green-700 border-green-200 py-0 gap-0.5">
                                  <CheckCircle2 size={10} />{eatCount}回
                                </Badge>
                              )}
                              {food.is_allergen && (
                                <Badge variant="outline" className="text-xs text-red-500 border-red-200 py-0">
                                  <AlertTriangle size={10} className="mr-0.5" />アレルゲン
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Badge className="text-xs bg-gray-200 text-gray-600 hover:bg-gray-200">
                                {food.min_months}ヶ月〜
                              </Badge>
                              {isCustom && customId && (
                                <button
                                  onClick={e => { e.stopPropagation(); deleteCustomFood(customId) }}
                                  className="text-gray-300 hover:text-red-400 ml-1"
                                >
                                  <X size={13} />
                                </button>
                              )}
                            </div>
                          </div>

                          {selectedFood?.id === food.id && (
                            <div className="mt-2 space-y-1.5 text-xs text-gray-600 border-t pt-2">
                              {food.preparation && (
                                <div className="flex gap-2">
                                  <span className="text-green-600 font-medium shrink-0">調理法</span>
                                  <span>{food.preparation}</span>
                                </div>
                              )}
                              {food.nutrition && (
                                <div className="flex gap-2">
                                  <span className="text-blue-600 font-medium shrink-0">栄養素</span>
                                  <span>{food.nutrition}</span>
                                </div>
                              )}
                              {food.caution && (
                                <div className="flex gap-2">
                                  <AlertTriangle size={12} className="text-red-500 shrink-0 mt-0.5" />
                                  <span className="text-red-600">{food.caution}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </button>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {/* Info */}
      <Card className="bg-blue-50 border-blue-100">
        <CardContent className="pt-3 pb-3 flex gap-2 text-xs text-blue-700">
          <Info size={14} className="shrink-0 mt-0.5" />
          <p>初めての食材は1日1種類ずつ、少量から始めてください。アレルギー反応がないか様子を見ながら進めましょう。</p>
        </CardContent>
      </Card>
      </>}
    </div>
  )
}
