export interface HealthGoals {
  weeklyAerobicMinutes: number
  strengthDays: number
  dailyWaterGlasses: number
  weeklySweetDrinks: number
  weeklyHighSugarMeals: number
  weeklyHighSaltMeals: number
  weeklyFriedMeals: number
  freeSugarPercent: number
  saltGrams: number
  saturatedFatPercent: number
  transFatPercent: number
  totalFatPercent: number
}

/** Defaults follow WHO general-population guidance; every value is user-editable. */
export var DEFAULT_GOALS: HealthGoals = {
  weeklyAerobicMinutes: 150,
  strengthDays: 2,
  dailyWaterGlasses: 8,
  weeklySweetDrinks: 3,
  weeklyHighSugarMeals: 3,
  weeklyHighSaltMeals: 3,
  weeklyFriedMeals: 2,
  freeSugarPercent: 10,
  saltGrams: 5,
  saturatedFatPercent: 10,
  transFatPercent: 1,
  totalFatPercent: 30,
}
