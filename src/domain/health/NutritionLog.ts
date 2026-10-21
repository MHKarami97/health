export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export type FoodTag = 'high-sugar' | 'high-salt' | 'fried' | 'processed' | 'vegetables' | 'fruit' | 'unsaturated-fat'

export interface NutritionLog {
  id: string
  date: string
  meal: MealType
  description: string
  tags: FoodTag[]
  waterGlasses: number
  sweetDrinks: number
}

export const MEAL_LABELS_FA: Record<MealType, string> = {
  breakfast: 'صبحانه',
  lunch: 'ناهار',
  dinner: 'شام',
  snack: 'میان‌وعده',
}

export const FOOD_TAG_LABELS_FA: Record<FoodTag, string> = {
  'high-sugar': 'قند زیاد',
  'high-salt': 'نمک زیاد',
  fried: 'سرخ‌شده',
  processed: 'فرآوری‌شده',
  vegetables: 'سبزیجات',
  fruit: 'میوه',
  'unsaturated-fat': 'چربی مفید',
}
