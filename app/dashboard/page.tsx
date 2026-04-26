import { createServerClient } from '@/lib/pocketbase/server'
import { getAgeInMonths, getCurrentStage } from '@/lib/foods-data'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CalendarDays, BookOpen, Plus } from 'lucide-react'

export default async function DashboardPage() {
  const pb = await createServerClient()
  const userId = pb.authStore.record?.id

  const childrenResult = await pb.collection('children').getFullList({
    filter: `user = "${userId}"`,
    sort: 'created',
  }).catch(() => [])
  const children = childrenResult

  const today = format(new Date(), 'yyyy-MM-dd')

  let todayRecords: { meal_time: string; foods: { food_name: string }[] }[] = []
  if (children.length > 0) {
    const childIds = children.map((c: { id: string }) => `child = "${c.id}"`).join(' || ')
    const records = await pb.collection('meal_records').getFullList({
      filter: `(${childIds}) && date = "${today}"`,
      fields: 'meal_time,foods',
    }).catch(() => [])
    todayRecords = records as { meal_time: string; foods: { food_name: string }[] }[]
  }

  const mealTimeLabels: Record<string, string> = {
    morning: '朝',
    noon: '昼',
    evening: '夜',
    snack: 'おやつ',
  }

  return (
    <div className="space-y-4">
      {/* 子供情報 */}
      {children && children.length > 0 ? (
        (children as unknown as { id: string; name: string; birthday: string }[]).map((child) => {
          const ageMonths = getAgeInMonths(child.birthday)
          const stage = getCurrentStage(ageMonths)
          return (
            <Card key={child.id} className="bg-gradient-to-br from-orange-100 to-yellow-50 border-orange-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-orange-200 flex items-center justify-center text-2xl">
                    👶
                  </div>
                  <div>
                    <p className="font-bold text-lg text-orange-900">{child.name}</p>
                    <p className="text-sm text-orange-700">{ageMonths}ヶ月</p>
                    {stage && (
                      <Badge className={`mt-1 text-xs ${stage.color}`}>
                        {stage.label} {stage.subtitle}
                      </Badge>
                    )}
                    {!stage && ageMonths < 5 && (
                      <Badge className="mt-1 text-xs bg-gray-100 text-gray-600">
                        離乳食開始前
                      </Badge>
                    )}
                  </div>
                </div>
                {stage && (
                  <p className="mt-3 text-xs text-orange-700 bg-white/60 rounded-lg p-2">
                    {stage.description}
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })
      ) : (
        <Card className="border-dashed border-2 border-orange-300">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-500 mb-3">まずはお子様の情報を登録しましょう</p>
            <Link href="/dashboard/settings">
              <Button className="bg-orange-500 hover:bg-orange-600">
                <Plus size={16} className="mr-1" />
                お子様を登録する
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* 今日の記録 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <span>📝</span>
            今日の記録（{format(new Date(), 'M月d日(E)', { locale: ja })}）
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayRecords.length > 0 ? (
            <div className="space-y-2">
              {todayRecords.map((record, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <Badge variant="outline" className="shrink-0">{mealTimeLabels[record.meal_time]}</Badge>
                  <span className="text-gray-600">
                    {Array.isArray(record.foods) && record.foods.length > 0
                      ? record.foods.map((f: { food_name: string }) => f.food_name).join('、')
                      : '記録なし'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">今日の記録はまだありません</p>
          )}
          <Link href={`/dashboard/records?date=${today}`} className="block mt-3">
            <Button variant="outline" className="w-full border-orange-300 text-orange-700 hover:bg-orange-50">
              <Plus size={16} className="mr-1" />
              記録を追加する
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* クイックアクセス */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/dashboard/calendar">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-4 text-center">
              <CalendarDays size={28} className="mx-auto text-orange-500 mb-1" />
              <p className="text-sm font-medium">カレンダー</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/foods">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-4 text-center">
              <BookOpen size={28} className="mx-auto text-green-500 mb-1" />
              <p className="text-sm font-medium">食材ガイド</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
