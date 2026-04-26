'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { ja } from 'date-fns/locale'
import { toast } from 'sonner'
import { getClient } from '@/lib/pocketbase/client'
import { getFoodsForAge, FOODS } from '@/lib/foods-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Camera, X, ChevronDown, ChevronUp } from 'lucide-react'
import Image from 'next/image'

interface RecordedFood {
  food_id: string
  food_name: string
  amount: string
  unit: string
  reaction: 'good' | 'ok' | 'bad' | 'allergy' | null
}

interface MealRecord {
  id: string
  meal_time: string
  foods: RecordedFood[]
  notes: string
  photos: string[]        // PocketBase: array of filenames
  photo_urls?: string[]   // local preview URLs before save
}

interface Child {
  id: string
  name: string
  birthday: string
}

interface Props {
  date: string
  child: Child | null
  ageMonths: number
  initialRecords: MealRecord[]
}

const MEAL_TIMES = [
  { id: 'morning', label: '朝食', emoji: '🌅' },
  { id: 'noon', label: '昼食', emoji: '☀️' },
  { id: 'evening', label: '夕食', emoji: '🌙' },
  { id: 'snack', label: 'おやつ', emoji: '🍪' },
]

const REACTIONS = [
  { id: 'good', label: 'よく食べた', emoji: '😋' },
  { id: 'ok', label: 'まあまあ', emoji: '😐' },
  { id: 'bad', label: '食べなかった', emoji: '😞' },
  { id: 'allergy', label: 'アレルギー反応', emoji: '⚠️' },
]

const UNITS = ['g', 'ml', '個', '枚', '杯', '口', '小さじ', '大さじ']

export function RecordsPage({ date, child, ageMonths, initialRecords }: Props) {
  const router = useRouter()
  const [records, setRecords] = useState<MealRecord[]>(initialRecords)
  const [activeMealTime, setActiveMealTime] = useState<string | null>(null)
  const [editingRecord, setEditingRecord] = useState<Partial<MealRecord> | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [pendingPhotos, setPendingPhotos] = useState<File[]>([])
  const [foodSearch, setFoodSearch] = useState('')
  const [showFoodPicker, setShowFoodPicker] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL

  function getPhotoUrl(record: MealRecord, filename: string): string {
    return `${pbUrl}/api/files/meal_records/${record.id}/${filename}`
  }

  const availableFoods = ageMonths > 0 ? getFoodsForAge(ageMonths) : FOODS

  const filteredFoods = availableFoods.filter(f =>
    f.name.includes(foodSearch) || foodSearch === ''
  ).slice(0, 20)

  function startNew(mealTime: string) {
    const existing = records.find(r => r.meal_time === mealTime)
    if (existing) {
      setEditingRecord({ ...existing })
    } else {
      setEditingRecord({ meal_time: mealTime, foods: [], notes: '', photos: [] })
    }
    setActiveMealTime(mealTime)
  }

  function addFood(food: { id: string; name: string }) {
    if (!editingRecord) return
    const newFood: RecordedFood = {
      food_id: food.id,
      food_name: food.name,
      amount: '',
      unit: 'g',
      reaction: null,
    }
    setEditingRecord(prev => ({
      ...prev,
      foods: [...(prev?.foods || []), newFood],
    }))
    setFoodSearch('')
    setShowFoodPicker(false)
  }

  function addCustomFood() {
    if (!foodSearch.trim()) return
    addFood({ id: `custom-${Date.now()}`, name: foodSearch.trim() })
  }

  function removeFood(index: number) {
    setEditingRecord(prev => ({
      ...prev,
      foods: prev?.foods?.filter((_, i) => i !== index) || [],
    }))
  }

  function updateFood(index: number, field: keyof RecordedFood, value: string) {
    setEditingRecord(prev => ({
      ...prev,
      foods: prev?.foods?.map((f, i) => i === index ? { ...f, [field]: value } : f) || [],
    }))
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploadingPhoto(true)
    // store File objects temporarily; uploaded on save
    const newFiles = Array.from(files)
    setPendingPhotos(prev => [...prev, ...newFiles])
    const previewUrls = newFiles.map(f => URL.createObjectURL(f))
    setEditingRecord(prev => ({
      ...prev,
      photo_urls: [...(prev?.photo_urls || []), ...previewUrls],
    }))
    setUploadingPhoto(false)
  }

  function removePhoto(url: string) {
    // remove from pending if it's a blob URL
    if (url.startsWith('blob:')) {
      const idx = (editingRecord?.photo_urls || []).indexOf(url)
      if (idx !== -1) setPendingPhotos(prev => prev.filter((_, i) => i !== idx))
    }
    setEditingRecord(prev => ({
      ...prev,
      photo_urls: prev?.photo_urls?.filter(u => u !== url) || [],
    }))
  }

  async function saveRecord() {
    if (!editingRecord || !child) return
    setSaving(true)
    const pb = getClient()

    const formData = new FormData()
    formData.append('child', child.id)
    formData.append('date', date)
    formData.append('meal_time', editingRecord.meal_time || '')
    formData.append('foods', JSON.stringify(editingRecord.foods || []))
    formData.append('notes', editingRecord.notes || '')
    pendingPhotos.forEach(file => formData.append('photos', file))

    try {
      if (editingRecord.id) {
        await pb.collection('meal_records').update(editingRecord.id, formData)
      } else {
        await pb.collection('meal_records').create(formData)
      }
      toast.success('記録を保存しました')
      setPendingPhotos([])
      router.refresh()
      setActiveMealTime(null)
      setEditingRecord(null)
    } catch {
      toast.error('保存に失敗しました')
    }
    setSaving(false)
  }

  async function deleteRecord(id: string) {
    const pb = getClient()
    try {
      await pb.collection('meal_records').delete(id)
      toast.success('記録を削除しました')
      setRecords(prev => prev.filter(r => r.id !== id))
    } catch {
      toast.error('削除に失敗しました')
    }
  }

  const parsedDate = parseISO(date)

  if (!child) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-gray-500">
          お子様の情報を登録してから記録を始めてください。
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-800">
          {format(parsedDate, 'M月d日(E)', { locale: ja })}の記録
        </h2>
        <span className="text-sm text-gray-500">{child.name}</span>
      </div>

      {MEAL_TIMES.map(mt => {
        const record = records.find(r => r.meal_time === mt.id)
        const isActive = activeMealTime === mt.id

        return (
          <Card key={mt.id} className={isActive ? 'border-orange-300 shadow-md' : ''}>
            <CardHeader className="pb-2 pt-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <span>{mt.emoji}</span>
                  {mt.label}
                  {record && <Badge className="text-xs bg-green-100 text-green-700">記録済み</Badge>}
                </CardTitle>
                <div className="flex gap-2">
                  {record && !isActive && (
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400"
                      onClick={() => deleteRecord(record.id)}>
                      <Trash2 size={14} />
                    </Button>
                  )}
                  <Button
                    variant={isActive ? 'default' : 'outline'}
                    size="sm"
                    className={`h-7 text-xs ${isActive ? 'bg-orange-500 hover:bg-orange-600' : 'border-orange-300 text-orange-700'}`}
                    onClick={() => {
                      if (isActive) {
                        setActiveMealTime(null)
                        setEditingRecord(null)
                      } else {
                        startNew(mt.id)
                      }
                    }}
                  >
                    {isActive ? (
                      <><ChevronUp size={14} className="mr-1" />閉じる</>
                    ) : record ? (
                      <><ChevronDown size={14} className="mr-1" />編集</>
                    ) : (
                      <><Plus size={14} className="mr-1" />追加</>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Preview */}
            {record && !isActive && (
              <CardContent className="pt-0 pb-3">
                <div className="text-xs text-gray-600 space-y-1">
                  {record.foods.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {record.foods.map((f, i) => (
                        <span key={i} className="bg-orange-50 border border-orange-100 rounded px-1.5 py-0.5">
                          {f.food_name}{f.amount ? ` ${f.amount}${f.unit}` : ''}
                        </span>
                      ))}
                    </div>
                  )}
                  {(record.photos || []).length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {(record.photos || []).map((filename, i) => (
                        <div key={i} className="relative w-14 h-14 rounded overflow-hidden">
                          <Image src={getPhotoUrl(record, filename)} alt="" fill className="object-cover" sizes="56px" /></div>
                      ))}
                    </div>
                  )}
                  {record.notes && <p className="text-gray-500 italic">{record.notes}</p>}
                </div>
              </CardContent>
            )}

            {/* Edit form */}
            {isActive && editingRecord && (
              <CardContent className="pt-0 pb-4 space-y-4">
                {/* Food picker */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700">食材</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs text-orange-600"
                      onClick={() => setShowFoodPicker(!showFoodPicker)}
                    >
                      <Plus size={12} className="mr-0.5" />食材を追加
                    </Button>
                  </div>

                  {showFoodPicker && (
                    <div className="border rounded-lg p-2 mb-2 bg-gray-50">
                      <div className="flex gap-1 mb-2">
                        <Input
                          placeholder="食材名で検索または入力..."
                          value={foodSearch}
                          onChange={e => setFoodSearch(e.target.value)}
                          className="h-8 text-xs"
                        />
                        {foodSearch && (
                          <Button size="sm" className="h-8 text-xs bg-orange-500 hover:bg-orange-600 shrink-0"
                            onClick={addCustomFood}>
                            追加
                          </Button>
                        )}
                      </div>
                      <div className="max-h-32 overflow-y-auto space-y-0.5">
                        {filteredFoods.map(food => (
                          <button
                            key={food.id}
                            onClick={() => addFood(food)}
                            className="w-full text-left px-2 py-1 text-xs rounded hover:bg-orange-100 flex items-center justify-between"
                          >
                            <span>{food.name}</span>
                            <span className="text-gray-400">{food.min_months}ヶ月〜</span>
                          </button>
                        ))}
                        {filteredFoods.length === 0 && (
                          <p className="text-xs text-gray-400 text-center py-2">
                            「追加」ボタンでオリジナル食材を記録できます
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {(editingRecord.foods || []).map((food, i) => (
                    <div key={i} className="border rounded-lg p-2 mb-2 bg-white">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium flex-1">{food.food_name}</span>
                        <button onClick={() => removeFood(i)} className="text-red-400 hover:text-red-600">
                          <X size={14} />
                        </button>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Input
                          placeholder="量"
                          value={food.amount}
                          onChange={e => updateFood(i, 'amount', e.target.value)}
                          className="h-7 text-xs w-20"
                        />
                        <select
                          value={food.unit}
                          onChange={e => updateFood(i, 'unit', e.target.value)}
                          className="h-7 text-xs border rounded px-1 bg-white"
                        >
                          {UNITS.map(u => <option key={u}>{u}</option>)}
                        </select>
                        <select
                          value={food.reaction || ''}
                          onChange={e => updateFood(i, 'reaction', e.target.value)}
                          className="h-7 text-xs border rounded px-1 bg-white flex-1"
                        >
                          <option value="">反応...</option>
                          {REACTIONS.map(r => (
                            <option key={r.id} value={r.id}>{r.emoji} {r.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Photos */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700">写真</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs text-orange-600"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPhoto}
                    >
                      <Camera size={12} className="mr-0.5" />
                      {uploadingPhoto ? 'アップロード中...' : '写真を追加'}
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                  </div>
                  {(editingRecord.photo_urls || []).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {(editingRecord.photo_urls || []).map((url, i) => (
                        <div key={i} className="relative w-16 h-16 rounded overflow-hidden group">
                          <Image src={url} alt="" fill className="object-cover" sizes="64px" />
                          <button
                            onClick={() => removePhoto(url)}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-bl p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <span className="text-xs font-medium text-gray-700 block mb-1">メモ</span>
                  <Textarea
                    placeholder="食事の様子、気づいたことなど..."
                    value={editingRecord.notes || ''}
                    onChange={e => setEditingRecord(prev => ({ ...prev, notes: e.target.value }))}
                    className="text-sm resize-none"
                    rows={2}
                  />
                </div>

                <Button
                  onClick={saveRecord}
                  disabled={saving}
                  className="w-full bg-orange-500 hover:bg-orange-600"
                >
                  {saving ? '保存中...' : '保存する'}
                </Button>
              </CardContent>
            )}
          </Card>
        )
      })}
    </div>
  )
}
