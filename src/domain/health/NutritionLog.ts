export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'
export type FoodTag = 'high-sugar' | 'high-salt' | 'fried' | 'processed' | 'fruit' | 'vegetables' | 'unsaturated-fat'

export interface NutritionLog {
  id: string
  date: string
  meal: MealType
  title: string
  tags: FoodTag[]
  calories: number | null
}

export interface DrinkLog {
  date: string
  water: number
  sweet: number
}

export var MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'صبحانه',
  lunch: 'ناهار',
  dinner: 'شام',
  snack: 'میان‌وعده',
}

export var TAG_LABELS: Record<FoodTag, string> = {
  'high-sugar': 'قند زیاد',
  'high-salt': 'نمک زیاد',
  fried: 'سرخ‌شده',
  processed: 'فرآوری‌شده',
  fruit: 'میوه',
  vegetables: 'سبزی',
  'unsaturated-fat': 'چربی مفید',
}

export var LIMIT_TAGS: FoodTag[] = ['high-sugar', 'high-salt', 'fried', 'processed']
export var POSITIVE_TAGS: FoodTag[] = ['fruit', 'vegetables', 'unsaturated-fat']

export interface QuickMeal {
  title: string
  meal: MealType
  tags: FoodTag[]
}

export var QUICK_MEALS: QuickMeal[] = [
  { title: 'سالاد و سبزی', meal: 'lunch', tags: ['vegetables'] },
  { title: 'میوه', meal: 'snack', tags: ['fruit'] },
  { title: 'ماهی', meal: 'dinner', tags: ['unsaturated-fat'] },
  { title: 'آجیل خام', meal: 'snack', tags: ['unsaturated-fat'] },
  { title: 'فست‌فود', meal: 'lunch', tags: ['processed', 'fried', 'high-salt'] },
  { title: 'شیرینی یا دسر', meal: 'snack', tags: ['high-sugar'] },
  { title: 'چیپس / تنقلات شور', meal: 'snack', tags: ['high-salt', 'processed', 'fried'] },
  { title: 'غذای خانگی', meal: 'dinner', tags: [] },
]
