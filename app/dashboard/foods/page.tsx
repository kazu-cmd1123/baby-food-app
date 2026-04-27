export const dynamic = 'force-dynamic'

import { createServerClient } from '@/lib/pocketbase/server'
import { FoodsGuide } from '@/components/foods-guide'
import { getAgeInMonths } from '@/lib/foods-data'

export default async function FoodsPage() {
  const pb = await createServerClient()
  const userId = pb.authStore.record?.id

  const children = await pb.collection('children').getFullList({
    filter: `user = "${userId}"`,
    sort: 'created',
  }).catch(() => [])

  const child = children[0] as unknown as { id: string; name: string; birthday: string } | undefined
  const ageMonths = child ? getAgeInMonths(child.birthday) : null

  // 累計記録（直近90日・最大500件）
  const since = new Date()
  since.setDate(since.getDate() - 90)
  const sinceStr = since.toISOString().split('T')[0]

  const [allRecords, initialPlans, initialCustomFoods] = child
    ? await Promise.all([
        pb.collection('meal_records').getFullList({
          filter: `child = "${child.id}" && date >= "${sinceStr}"`,
          fields: 'date,foods',
          sort: '-date',
        }).catch(() => []),
        pb.collection('planned_foods').getFullList({
          filter: `child = "${child.id}"`,
          sort: '-created',
        }).catch(() => []),
        pb.collection('custom_foods').getFullList({
          filter: `child = "${child.id}"`,
          sort: 'created',
        }).catch(() => []),
      ])
    : [[], [], []]

  return (
    <FoodsGuide
      ageMonths={ageMonths}
      childName={child?.name}
      childId={child?.id}
      allRecords={allRecords as never[]}
      initialPlans={initialPlans as never[]}
      initialCustomFoods={initialCustomFoods as never[]}
    />
  )
}
