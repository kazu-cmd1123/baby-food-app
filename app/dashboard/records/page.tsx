export const dynamic = 'force-dynamic'

import { createServerClient } from '@/lib/pocketbase/server'
import { RecordsPage } from '@/components/records-page'
import { getAgeInMonths } from '@/lib/foods-data'

interface Props {
  searchParams: Promise<{ date?: string }>
}

export default async function RecordsServerPage({ searchParams }: Props) {
  const params = await searchParams
  const date = params.date || new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().split('T')[0] // JST

  const pb = await createServerClient()
  const userId = pb.authStore.record?.id

  const children = await pb.collection('children').getFullList({
    filter: `user = "${userId}"`,
    sort: 'created',
  }).catch(() => [])

  const child = children[0] as unknown as { id: string; name: string; birthday: string } | undefined
  const ageMonths = child ? getAgeInMonths(child.birthday) : 0

  const records = child
    ? await pb.collection('meal_records').getFullList({
        filter: `child = "${child.id}" && date = "${date}"`,
        sort: 'created',
      }).catch(() => [])
    : []

  return (
    <RecordsPage
      date={date}
      child={child || null}
      ageMonths={ageMonths}
      initialRecords={records as never[]}
    />
  )
}
