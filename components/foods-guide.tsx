'use client'

import { useState, useMemo } from 'react'
import { FOODS, AGE_STAGES, FOOD_CATEGORIES, getFoodsForAge, getFoodsForStage } from '@/lib/foods-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, AlertTriangle, Info } from 'lucide-react'
import { Food } from '@/types'

interface Props {
  ageMonths: number | null
  childName?: string
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

export function FoodsGuide({ ageMonths, childName }: Props) {
  const [activeTab, setActiveTab] = useState<'current' | '5-6' | '7-8' | '9-11' | '12-18'>('current')
  const [search, setSearch] = useState('')
  const [selectedFood, setSelectedFood] = useState<Food | null>(null)

  const displayFoods = useMemo(() => {
    let foods: Food[] = []
    if (activeTab === 'current') {
      foods = ageMonths ? getFoodsForAge(ageMonths) : []
    } else {
      const stageMin = parseInt(activeTab.split('-')[0])
      foods = getFoodsForStage(stageMin)
    }
    if (search) {
      foods = foods.filter(f =>
        f.name.includes(search) ||
        f.preparation.includes(search) ||
        FOOD_CATEGORIES[f.category].includes(search)
      )
    }
    return foods
  }, [activeTab, ageMonths, search])

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

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <h2 className="font-bold text-lg text-gray-800">食材ガイド</h2>
      </div>

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
                {foods.map(food => (
                  <button
                    key={food.id}
                    onClick={() => setSelectedFood(selectedFood?.id === food.id ? null : food)}
                    className="w-full text-left"
                  >
                    <div className={`rounded-lg border p-3 transition-colors ${
                      selectedFood?.id === food.id ? 'border-orange-300 bg-orange-50' : 'bg-gray-50 hover:bg-orange-50 hover:border-orange-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{food.name}</span>
                          {food.is_allergen && (
                            <Badge variant="outline" className="text-xs text-red-500 border-red-200 py-0">
                              <AlertTriangle size={10} className="mr-0.5" />アレルゲン
                            </Badge>
                          )}
                        </div>
                        <Badge className="text-xs bg-gray-200 text-gray-600 hover:bg-gray-200">
                          {food.min_months}ヶ月〜
                        </Badge>
                      </div>

                      {selectedFood?.id === food.id && (
                        <div className="mt-2 space-y-1.5 text-xs text-gray-600 border-t pt-2">
                          <div className="flex gap-2">
                            <span className="text-green-600 font-medium shrink-0">調理法</span>
                            <span>{food.preparation}</span>
                          </div>
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
                ))}
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
    </div>
  )
}
