import { createServerClient } from '@/lib/pocketbase/server'
import { FoodsGuide } from '@/components/foods-guide'
import { getAgeInMonths } from '@/lib/foods-data'

export default async function FoodsPage() {
  const pb = await createServerClient()
  const userId = pb.authStore.record?.id

  const children = await pb.collection('children').getFullList({
    filter: `user = "${userId}"`,
    fields: 'name,birthday',
    sort: 'created',
  }).catch(() => [])

  const child = children[0] as unknown as { name: string; birthday: string } | undefined
  const ageMonths = child ? getAgeInMonths(child.birthday) : null

  return <FoodsGuide ageMonths={ageMonths} childName={child?.name} />
}
