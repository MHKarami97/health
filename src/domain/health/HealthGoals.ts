export interface HealthGoals {
  weeklyModerateMinutes: number
  weeklyVigorousMinutes: number
  strengthDays: number
  dailyWaterGlasses: number
  dailySweetDrinkLimit: number
  weeklyHighSugarMeals: number
  weeklyHighSaltMeals: number
  weeklyFriedMeals: number
  trackingWeight: boolean
}

export const DEFAULT_HEALTH_GOALS: HealthGoals = {
  weeklyModerateMinutes: 150,
  weeklyVigorousMinutes: 75,
  strengthDays: 2,
  dailyWaterGlasses: 8,
  dailySweetDrinkLimit: 0,
  weeklyHighSugarMeals: 2,
  weeklyHighSaltMeals: 2,
  weeklyFriedMeals: 1,
  trackingWeight: false,
}
