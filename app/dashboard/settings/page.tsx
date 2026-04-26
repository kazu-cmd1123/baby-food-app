import { createServerClient } from '@/lib/pocketbase/server'
import { SettingsPage } from '@/components/settings-page'

export default async function Settings() {
  const pb = await createServerClient()
  const userId = pb.authStore.record?.id
  const userEmail = pb.authStore.record?.email || ''

  const children = await pb.collection('children').getFullList({
    filter: `user = "${userId}"`,
    sort: 'created',
  }).catch(() => [])

  const allergies = children.length > 0
    ? await pb.collection('allergy_records').getFullList({
        filter: children.map((c: { id: string }) => `child = "${c.id}"`).join(' || '),
        sort: '-date',
      }).catch(() => [])
    : []

  return (
    <SettingsPage
      userEmail={userEmail}
      initialChildren={children as never[]}
      initialAllergies={allergies as never[]}
    />
  )
}
