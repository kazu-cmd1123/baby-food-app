export type AgeStage = '5-6' | '7-8' | '9-11' | '12-18'

export interface Child {
  id: string
  user_id: string
  name: string
  birthday: string
  created_at: string
}

export interface MealRecord {
  id: string
  child_id: string
  date: string
  meal_time: 'morning' | 'noon' | 'evening' | 'snack'
  foods: RecordedFood[]
  notes: string
  photo_urls: string[]
  created_at: string
}

export interface RecordedFood {
  food_id: string
  food_name: string
  amount: string
  unit: string
  reaction: 'good' | 'ok' | 'bad' | 'allergy' | null
}

export interface Food {
  id: string
  name: string
  category: FoodCategory
  min_months: number
  max_months: number | null
  preparation: string
  caution: string | null
  nutrition: string | null
  is_allergen: boolean
}

export type FoodCategory =
  | 'grain'
  | 'vegetable'
  | 'fruit'
  | 'protein'
  | 'dairy'
  | 'fish'
  | 'seasoning'

export interface AllergyRecord {
  id: string
  child_id: string
  food_name: string
  severity: 'mild' | 'moderate' | 'severe'
  notes: string
  date: string
}
