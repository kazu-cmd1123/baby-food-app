import { Food, FoodCategory } from '@/types'

export const FOODS: Food[] = [
  // ===== 5〜6ヶ月 (ごっくん期) =====
  { id: 'rice-porridge-10x', name: '10倍粥', category: 'grain', min_months: 5, max_months: null, preparation: 'お米1に対して水10で炊き、なめらかにすりつぶす', caution: null, nutrition: '炭水化物・エネルギー源', is_allergen: false },
  { id: 'carrot', name: 'にんじん', category: 'vegetable', min_months: 5, max_months: null, preparation: 'やわらかく茹でてすりつぶす。裏ごしするとさらになめらか', caution: null, nutrition: 'βカロテン・ビタミンA', is_allergen: false },
  { id: 'pumpkin', name: 'かぼちゃ', category: 'vegetable', min_months: 5, max_months: null, preparation: '皮と種を取り除き、やわらかく茹でてすりつぶす', caution: null, nutrition: 'βカロテン・ビタミンC', is_allergen: false },
  { id: 'potato', name: 'じゃがいも', category: 'vegetable', min_months: 5, max_months: null, preparation: '皮をむき、茹でてすりつぶす。水分を加えてのばす', caution: null, nutrition: 'ビタミンC・炭水化物', is_allergen: false },
  { id: 'sweet-potato', name: 'さつまいも', category: 'vegetable', min_months: 5, max_months: null, preparation: '皮をむき、やわらかく茹でてすりつぶす', caution: null, nutrition: 'ビタミンC・食物繊維', is_allergen: false },
  { id: 'tofu', name: '豆腐', category: 'protein', min_months: 5, max_months: null, preparation: '絹ごし豆腐を電子レンジで加熱し、なめらかにつぶす', caution: '大豆アレルギーに注意', nutrition: 'たんぱく質・カルシウム', is_allergen: true },
  { id: 'white-fish', name: '白身魚（タラ・ひらめ）', category: 'fish', min_months: 5, max_months: null, preparation: 'やわらかく茹でて、骨を取り除きすりつぶす', caution: 'アレルギーに注意。初めは少量から', nutrition: 'たんぱく質・DHA', is_allergen: true },
  { id: 'broccoli', name: 'ブロッコリー', category: 'vegetable', min_months: 5, max_months: null, preparation: '穂先だけをやわらかく茹でてすりつぶす', caution: null, nutrition: 'ビタミンC・葉酸', is_allergen: false },
  { id: 'apple', name: 'りんご', category: 'fruit', min_months: 5, max_months: null, preparation: 'すりおろして加熱する。生のままは6ヶ月以降', caution: null, nutrition: 'ビタミンC・食物繊維', is_allergen: false },
  { id: 'banana', name: 'バナナ', category: 'fruit', min_months: 5, max_months: null, preparation: 'よくつぶしてなめらかにする', caution: '糖分が多いので少量から', nutrition: 'カリウム・エネルギー', is_allergen: false },
  { id: 'spinach-56', name: 'ほうれん草', category: 'vegetable', min_months: 5, max_months: null, preparation: 'やわらかく茹でて、葉先だけをすりつぶして裏ごし', caution: 'えぐみが強いので茹でこぼす', nutrition: '鉄分・葉酸', is_allergen: false },
  { id: 'komatsuna', name: '小松菜', category: 'vegetable', min_months: 5, max_months: null, preparation: 'やわらかく茹でて、葉先だけをすりつぶす', caution: null, nutrition: 'カルシウム・鉄分', is_allergen: false },

  // ===== 7〜8ヶ月 (もぐもぐ期) =====
  { id: 'rice-porridge-7x', name: '7倍粥', category: 'grain', min_months: 7, max_months: null, preparation: 'お米1に対して水7で炊く。粒が少し残る程度に', caution: null, nutrition: '炭水化物・エネルギー源', is_allergen: false },
  { id: 'bread', name: '食パン', category: 'grain', min_months: 7, max_months: null, preparation: '耳を切り落とし、ミルクで煮てパン粥に。牛乳アレルギーに注意', caution: '小麦アレルギーに注意', nutrition: '炭水化物・たんぱく質', is_allergen: true },
  { id: 'udon', name: 'うどん', category: 'grain', min_months: 7, max_months: null, preparation: 'やわらかく茹でて2〜3cm程度に切る', caution: '小麦アレルギーに注意', nutrition: '炭水化物', is_allergen: true },
  { id: 'chicken-breast', name: '鶏ささみ', category: 'protein', min_months: 7, max_months: null, preparation: 'すじを取り除き、やわらかく茹でてほぐす。なめらかにすりつぶす', caution: null, nutrition: 'たんぱく質・低脂肪', is_allergen: false },
  { id: 'egg-yolk', name: '卵黄', category: 'protein', min_months: 7, max_months: 8, preparation: '固ゆで卵の卵黄だけを使う。耳かき1さじから始める', caution: '卵アレルギーに注意。必ず加熱。初めは極少量から', nutrition: 'たんぱく質・鉄分・ビタミン', is_allergen: true },
  { id: 'shirasu', name: 'しらす', category: 'fish', min_months: 7, max_months: null, preparation: '熱湯をかけて塩抜きし、すりつぶす', caution: '塩分が多いので必ず塩抜きする', nutrition: 'カルシウム・DHA・鉄分', is_allergen: true },
  { id: 'salmon', name: '鮭', category: 'fish', min_months: 7, max_months: null, preparation: '塩鮭ではなく生鮭を使用。やわらかく加熱してほぐす', caution: '骨に注意。塩分に注意', nutrition: 'DHA・たんぱく質', is_allergen: true },
  { id: 'yogurt', name: 'プレーンヨーグルト', category: 'dairy', min_months: 7, max_months: null, preparation: 'プレーンの無糖タイプをそのまま使用', caution: '牛乳アレルギーに注意', nutrition: 'カルシウム・乳酸菌', is_allergen: true },
  { id: 'cheese', name: 'カッテージチーズ', category: 'dairy', min_months: 7, max_months: null, preparation: '無塩タイプを選ぶ。そのまま使用可', caution: '牛乳アレルギーに注意。塩分の多いものは避ける', nutrition: 'カルシウム・たんぱく質', is_allergen: true },
  { id: 'natto', name: '納豆', category: 'protein', min_months: 7, max_months: null, preparation: '熱湯をかけてたれを落とし、細かく刻む', caution: '大豆アレルギーに注意', nutrition: 'たんぱく質・ビタミンK', is_allergen: true },
  { id: 'daikon', name: '大根', category: 'vegetable', min_months: 7, max_months: null, preparation: 'やわらかく茹でて、みじん切りまたはすりおろし', caution: null, nutrition: 'ビタミンC・消化酵素', is_allergen: false },
  { id: 'tomato', name: 'トマト', category: 'vegetable', min_months: 7, max_months: null, preparation: '皮と種を取り除き、細かく刻む', caution: '酸味が強い場合は加熱する', nutrition: 'リコピン・ビタミンC', is_allergen: false },
  { id: 'corn', name: 'とうもろこし', category: 'vegetable', min_months: 7, max_months: null, preparation: 'やわらかく茹でて裏ごしし、薄皮を取り除く', caution: '薄皮は消化しにくいので必ず除去', nutrition: '炭水化物・食物繊維', is_allergen: false },

  // ===== 9〜11ヶ月 (かみかみ期) =====
  { id: 'rice-porridge-5x', name: '5倍粥', category: 'grain', min_months: 9, max_months: null, preparation: 'お米1に対して水5で炊く。粒の形が残る程度', caution: null, nutrition: '炭水化物・エネルギー源', is_allergen: false },
  { id: 'pasta', name: 'パスタ', category: 'grain', min_months: 9, max_months: null, preparation: 'やわらかく茹でて1〜2cm程度に切る', caution: '小麦アレルギーに注意', nutrition: '炭水化物', is_allergen: true },
  { id: 'chicken-thigh', name: '鶏もも肉', category: 'protein', min_months: 9, max_months: null, preparation: '脂身を取り除き、やわらかく茹でて細かくほぐす', caution: null, nutrition: 'たんぱく質・鉄分', is_allergen: false },
  { id: 'tuna', name: 'ツナ缶（水煮）', category: 'fish', min_months: 9, max_months: null, preparation: '水煮缶を選び、熱湯をかけて油を落としてほぐす', caution: '油漬けは避ける。塩分に注意', nutrition: 'たんぱく質・DHA', is_allergen: true },
  { id: 'whole-egg', name: '全卵', category: 'protein', min_months: 9, max_months: null, preparation: '固ゆで卵全体を使用。必ず十分に加熱する', caution: '卵アレルギーに注意', nutrition: 'たんぱく質・鉄分・ビタミン', is_allergen: true },
  { id: 'minced-meat', name: '豚ひき肉', category: 'protein', min_months: 9, max_months: null, preparation: 'よく火を通してそぼろ状にする', caution: '必ず完全に加熱する', nutrition: 'たんぱく質・鉄分・亜鉛', is_allergen: false },
  { id: 'milk-cooking', name: '牛乳（調理用）', category: 'dairy', min_months: 9, max_months: null, preparation: '加熱して料理に使用。飲用は1歳以降', caution: '牛乳アレルギーに注意。飲用は1歳から', nutrition: 'カルシウム・たんぱく質', is_allergen: true },
  { id: 'potato-starch', name: 'きなこ', category: 'grain', min_months: 9, max_months: null, preparation: 'お粥やヨーグルトに混ぜる', caution: '大豆アレルギーに注意', nutrition: 'たんぱく質・鉄分・カルシウム', is_allergen: true },
  { id: 'avocado', name: 'アボカド', category: 'fruit', min_months: 9, max_months: null, preparation: '種と皮を除き、細かく刻む', caution: '脂肪分が多いので少量から', nutrition: '良質な脂質・ビタミンE', is_allergen: false },
  { id: 'cabbage', name: 'キャベツ', category: 'vegetable', min_months: 9, max_months: null, preparation: 'やわらかく茹でて細かく刻む', caution: null, nutrition: 'ビタミンC・食物繊維', is_allergen: false },
  { id: 'mushroom', name: 'しいたけ', category: 'vegetable', min_months: 9, max_months: null, preparation: 'やわらかく煮て細かく刻む。生は不可', caution: '必ず加熱する', nutrition: 'ビタミンD・食物繊維', is_allergen: false },

  // ===== 12〜18ヶ月 (ぱくぱく期) =====
  { id: 'soft-rice', name: '軟飯', category: 'grain', min_months: 12, max_months: null, preparation: 'お米1に対して水2〜2.5で炊く。大人の半分くらいのかたさ', caution: null, nutrition: '炭水化物・エネルギー源', is_allergen: false },
  { id: 'pork', name: '豚肉', category: 'protein', min_months: 12, max_months: null, preparation: 'やわらかく調理して食べやすく切る', caution: '必ず完全に加熱する', nutrition: 'たんぱく質・ビタミンB1', is_allergen: false },
  { id: 'beef', name: '牛肉', category: 'protein', min_months: 12, max_months: null, preparation: 'やわらかく調理して食べやすく切る', caution: '必ず完全に加熱する', nutrition: 'たんぱく質・鉄分・亜鉛', is_allergen: false },
  { id: 'milk-drink', name: '牛乳（飲用）', category: 'dairy', min_months: 12, max_months: null, preparation: 'そのまま飲用可能。温めても可', caution: '1歳未満への飲用は不可', nutrition: 'カルシウム・たんぱく質', is_allergen: true },
  { id: 'soy-sauce-small', name: '醤油・味噌（少量）', category: 'seasoning', min_months: 12, max_months: null, preparation: 'ほんの少量（大人の1/4程度）の味付けに', caution: '塩分過多に注意', nutrition: 'うまみ成分', is_allergen: true },
  { id: 'eggplant', name: 'なす', category: 'vegetable', min_months: 12, max_months: null, preparation: '皮をむき、やわらかく調理して食べやすく切る', caution: null, nutrition: 'ポリフェノール・食物繊維', is_allergen: false },
  { id: 'shrimp', name: 'えび', category: 'fish', min_months: 12, max_months: null, preparation: 'やわらかく加熱して細かく刻む', caution: '甲殻類アレルギーに注意。必ず加熱', nutrition: 'たんぱく質・カルシウム', is_allergen: true },
  { id: 'kiwi', name: 'キウイ', category: 'fruit', min_months: 12, max_months: null, preparation: '皮をむいて細かく刻む', caution: 'アレルギーの出ることがあるので注意', nutrition: 'ビタミンC・食物繊維', is_allergen: true },
]

export const FOOD_CATEGORIES: Record<string, string> = {
  grain: '主食・穀物',
  vegetable: '野菜',
  fruit: '果物',
  protein: 'たんぱく質',
  dairy: '乳製品',
  fish: '魚介類',
  seasoning: '調味料',
}

export const AGE_STAGES = [
  { id: '5-6', label: '5〜6ヶ月', subtitle: 'ごっくん期', min: 5, max: 6, color: 'bg-yellow-100 text-yellow-800', description: 'なめらかにすりつぶした状態から始めます。新しい食材は1日1種類ずつ、小さじ1から。' },
  { id: '7-8', label: '7〜8ヶ月', subtitle: 'もぐもぐ期', min: 7, max: 8, color: 'bg-green-100 text-green-800', description: '舌でつぶせるやわらかさが目安。豆腐くらいのかたさ。1日2回食に。' },
  { id: '9-11', label: '9〜11ヶ月', subtitle: 'かみかみ期', min: 9, max: 11, color: 'bg-blue-100 text-blue-800', description: '歯ぐきでつぶせるかたさ。バナナくらいが目安。1日3回食に。' },
  { id: '12-18', label: '12〜18ヶ月', subtitle: 'ぱくぱく期', min: 12, max: 18, color: 'bg-purple-100 text-purple-800', description: '歯でかめるかたさ。大人の食事に近づけていく時期。' },
]

export function getAgeInMonths(birthday: string): number {
  const birth = new Date(birthday)
  const now = new Date()
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  return Math.max(0, months)
}

export function getCurrentStage(ageMonths: number) {
  if (ageMonths < 5) return null
  if (ageMonths <= 6) return AGE_STAGES[0]
  if (ageMonths <= 8) return AGE_STAGES[1]
  if (ageMonths <= 11) return AGE_STAGES[2]
  if (ageMonths <= 18) return AGE_STAGES[3]
  return null
}

export function getFoodsForAge(ageMonths: number): Food[] {
  return FOODS.filter(f => f.min_months <= ageMonths)
}

export function getFoodsForStage(stageMin: number): Food[] {
  return FOODS.filter(f => f.min_months === stageMin)
}
