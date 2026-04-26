'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { getClient } from '@/lib/pocketbase/client'
import { getAgeInMonths, getCurrentStage } from '@/lib/foods-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Trash2, Plus, LogOut, Baby, AlertTriangle } from 'lucide-react'

interface Child {
  id: string
  name: string
  birthday: string
}

interface AllergyRecord {
  id: string
  child: string   // PocketBase relation ID
  food_name: string
  severity: string
  notes: string
  date: string
}

interface Props {
  userEmail: string
  initialChildren: Child[]
  initialAllergies: AllergyRecord[]
}

const SEVERITY_LABELS: Record<string, { label: string; color: string }> = {
  mild: { label: '軽度', color: 'bg-yellow-100 text-yellow-800' },
  moderate: { label: '中度', color: 'bg-orange-100 text-orange-800' },
  severe: { label: '重度', color: 'bg-red-100 text-red-800' },
}

export function SettingsPage({ userEmail, initialChildren, initialAllergies }: Props) {
  const router = useRouter()
  const [children, setChildren] = useState<Child[]>(initialChildren)
  const [allergies, setAllergies] = useState<AllergyRecord[]>(initialAllergies)
  const [newChild, setNewChild] = useState({ name: '', birthday: '' })
  const [showAddChild, setShowAddChild] = useState(false)
  const [newAllergy, setNewAllergy] = useState({ food_name: '', severity: 'mild', notes: '', date: new Date().toISOString().split('T')[0] })
  const [showAddAllergy, setShowAddAllergy] = useState(false)
  const [selectedChildId, setSelectedChildId] = useState(initialChildren[0]?.id || '')
  const [saving, setSaving] = useState(false)

  async function addChild() {
    if (!newChild.name.trim() || !newChild.birthday) {
      toast.error('名前と誕生日を入力してください')
      return
    }
    setSaving(true)
    const pb = getClient()
    try {
      const data = await pb.collection('children').create({
        user: pb.authStore.record?.id,
        name: newChild.name.trim(),
        birthday: newChild.birthday,
      })
      setChildren(prev => [...prev, data as unknown as Child])
      setNewChild({ name: '', birthday: '' })
      setShowAddChild(false)
      toast.success(`${data.name}を登録しました`)
      router.refresh()
    } catch {
      toast.error('登録に失敗しました')
    }
    setSaving(false)
  }

  async function deleteChild(id: string) {
    if (!confirm('このお子様の記録をすべて削除しますか？')) return
    const pb = getClient()
    try {
      await pb.collection('children').delete(id)
      setChildren(prev => prev.filter(c => c.id !== id))
      toast.success('削除しました')
    } catch {
      toast.error('削除に失敗しました')
    }
  }

  async function addAllergy() {
    if (!newAllergy.food_name.trim() || !selectedChildId) {
      toast.error('食材名とお子様を選択してください')
      return
    }
    setSaving(true)
    const pb = getClient()
    try {
      const data = await pb.collection('allergy_records').create({
        child: selectedChildId,
        food_name: newAllergy.food_name,
        severity: newAllergy.severity,
        notes: newAllergy.notes,
        date: newAllergy.date,
      })
      setAllergies(prev => [data as unknown as AllergyRecord, ...prev])
      setNewAllergy({ food_name: '', severity: 'mild', notes: '', date: new Date().toISOString().split('T')[0] })
      setShowAddAllergy(false)
      toast.success('アレルギー情報を登録しました')
    } catch {
      toast.error('登録に失敗しました')
    }
    setSaving(false)
  }

  async function deleteAllergy(id: string) {
    const pb = getClient()
    try {
      await pb.collection('allergy_records').delete(id)
      setAllergies(prev => prev.filter(a => a.id !== id))
    } catch {
      toast.error('削除に失敗しました')
    }
  }

  async function handleLogout() {
    const pb = getClient()
    pb.authStore.clear()
    document.cookie = 'pb_auth=; Max-Age=0; path=/'
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {/* Account info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gray-700">アカウント情報</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-gray-600 mb-3">{userEmail}</p>
          <Button
            variant="outline"
            size="sm"
            className="text-red-500 border-red-200 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut size={14} className="mr-1" />
            ログアウト
          </Button>
        </CardContent>
      </Card>

      {/* Children management */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Baby size={16} className="text-orange-500" />
              お子様の管理
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-orange-600"
              onClick={() => setShowAddChild(!showAddChild)}
            >
              <Plus size={14} className="mr-0.5" />追加
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {showAddChild && (
            <div className="border rounded-lg p-3 bg-orange-50 space-y-2">
              <div>
                <Label className="text-xs">お子様の名前</Label>
                <Input
                  placeholder="例：はなこ"
                  value={newChild.name}
                  onChange={e => setNewChild(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">誕生日</Label>
                <Input
                  type="date"
                  value={newChild.birthday}
                  onChange={e => setNewChild(prev => ({ ...prev, birthday: e.target.value }))}
                  className="mt-1 h-8 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="bg-orange-500 hover:bg-orange-600 h-7 text-xs" onClick={addChild} disabled={saving}>
                  {saving ? '登録中...' : '登録'}
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowAddChild(false)}>
                  キャンセル
                </Button>
              </div>
            </div>
          )}

          {children.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-2">まだ登録されていません</p>
          ) : (
            children.map(child => {
              const age = getAgeInMonths(child.birthday)
              const stage = getCurrentStage(age)
              return (
                <div key={child.id} className="flex items-center justify-between border rounded-lg p-3 bg-white">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{child.name}</span>
                      {stage && (
                        <Badge className={`text-xs ${stage.color}`}>{stage.subtitle}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {child.birthday} （{age}ヶ月）
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-400 hover:text-red-600"
                    onClick={() => deleteChild(child.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      {/* Allergy management */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-500" />
              アレルギー管理
            </CardTitle>
            {children.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-red-600"
                onClick={() => setShowAddAllergy(!showAddAllergy)}
              >
                <Plus size={14} className="mr-0.5" />追加
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {showAddAllergy && (
            <div className="border rounded-lg p-3 bg-red-50 space-y-2">
              {children.length > 1 && (
                <div>
                  <Label className="text-xs">お子様</Label>
                  <select
                    value={selectedChildId}
                    onChange={e => setSelectedChildId(e.target.value)}
                    className="w-full mt-1 h-8 text-sm border rounded px-2 bg-white"
                  >
                    {children.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <Label className="text-xs">食材名</Label>
                <Input
                  placeholder="例：卵"
                  value={newAllergy.food_name}
                  onChange={e => setNewAllergy(prev => ({ ...prev, food_name: e.target.value }))}
                  className="mt-1 h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">症状の程度</Label>
                <select
                  value={newAllergy.severity}
                  onChange={e => setNewAllergy(prev => ({ ...prev, severity: e.target.value }))}
                  className="w-full mt-1 h-8 text-sm border rounded px-2 bg-white"
                >
                  <option value="mild">軽度（かゆみ・湿疹程度）</option>
                  <option value="moderate">中度（嘔吐・腹痛など）</option>
                  <option value="severe">重度（アナフィラキシー等）</option>
                </select>
              </div>
              <div>
                <Label className="text-xs">メモ</Label>
                <Input
                  placeholder="症状の詳細など"
                  value={newAllergy.notes}
                  onChange={e => setNewAllergy(prev => ({ ...prev, notes: e.target.value }))}
                  className="mt-1 h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">発症日</Label>
                <Input
                  type="date"
                  value={newAllergy.date}
                  onChange={e => setNewAllergy(prev => ({ ...prev, date: e.target.value }))}
                  className="mt-1 h-8 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="bg-red-500 hover:bg-red-600 h-7 text-xs" onClick={addAllergy} disabled={saving}>
                  {saving ? '登録中...' : '登録'}
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowAddAllergy(false)}>
                  キャンセル
                </Button>
              </div>
            </div>
          )}

          {allergies.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-2">アレルギー記録はありません</p>
          ) : (
            allergies.map(allergy => {
              const sev = SEVERITY_LABELS[allergy.severity]
              const childName = children.find(c => c.id === allergy.child)?.name
              return (
                <div key={allergy.id} className="flex items-start justify-between border rounded-lg p-3 bg-white">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{allergy.food_name}</span>
                      <Badge className={`text-xs ${sev.color}`}>{sev.label}</Badge>
                    </div>
                    {childName && <p className="text-xs text-gray-500">{childName}</p>}
                    {allergy.notes && <p className="text-xs text-gray-500">{allergy.notes}</p>}
                    <p className="text-xs text-gray-400 mt-0.5">{allergy.date}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-400 hover:text-red-600"
                    onClick={() => deleteAllergy(allergy.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}
