import { createServerClient } from '@/lib/pocketbase/server'
import { CalendarView } from '@/components/calendar-view'

export default async function CalendarPage() {
  const pb = await createServerClient()
  const userId = pb.authStore.record?.id

  const children = await pb.collection('children').getFullList({
    filter: `user = "${userId}"`,
    fields: 'id,name',
    sort: 'created',
  }).catch(() => [])

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = `${year}-${String(month).padStart(2, '0')}-31`

  let records: { date: string; meal_time: string }[] = []
  if (children.length > 0) {
    const childFilter = children.map((c: { id: string }) => `child = "${c.id}"`).join(' || ')
    records = await pb.collection('meal_records').getFullList({
      filter: `(${childFilter}) && date >= "${startDate}" && date <= "${endDate}"`,
      fields: 'date,meal_time',
    }).catch(() => []) as { date: string; meal_time: string }[]
  }

  return (
    <CalendarView
      initialRecords={records}
      children={children as { id: string; name: string }[]}
    />
  )
}
