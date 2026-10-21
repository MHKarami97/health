import type { ActivityLog, ActivityIntensity } from './ActivityLog'
import type { NutritionLog, FoodTag } from './NutritionLog'

export interface WeeklyActivitySummary {
  moderateMinutes: number
  vigorousMinutes: number
  strengthDays: number
  totalMinutes: number
}

export interface WeeklyNutritionSummary {
  highSugarMeals: number
  highSaltMeals: number
  friedMeals: number
  vegetableFruitMeals: number
  waterGlasses: number
  sweetDrinks: number
}

var countTag = (logs: NutritionLog[], tag: FoodTag): number =>
  logs.filter((log) => log.tags.includes(tag)).length

export function summarizeActivity(logs: ActivityLog[]): WeeklyActivitySummary {
  var moderate = logs.filter((log) => log.intensity === 'moderate')
  var vigorous = logs.filter((log) => log.intensity === 'vigorous')
  var strength = logs.filter((log) => log.intensity === 'strength')
  var strengthDays = new Set(strength.map((log) => log.date)).size

  return {
    moderateMinutes: moderate.reduce((total, log) => total + log.minutes, 0),
    vigorousMinutes: vigorous.reduce((total, log) => total + log.minutes, 0),
    strengthDays,
    totalMinutes: logs.reduce((total, log) => total + log.minutes, 0),
  }
}

export function summarizeNutrition(logs: NutritionLog[]): WeeklyNutritionSummary {
  return {
    highSugarMeals: countTag(logs, 'high-sugar'),
    highSaltMeals: countTag(logs, 'high-salt'),
    friedMeals: countTag(logs, 'fried'),
    vegetableFruitMeals: countTag(logs, 'vegetables') + countTag(logs, 'fruit'),
    waterGlasses: logs.reduce((total, log) => total + log.waterGlasses, 0),
    sweetDrinks: logs.reduce((total, log) => total + log.sweetDrinks, 0),
  }
}

export function activityProgress(summary: WeeklyActivitySummary): number {
  var moderateCredit = summary.moderateMinutes
  var vigorousCredit = summary.vigorousMinutes * 2
  var target = 150
  return Math.min(100, Math.round(((moderateCredit + vigorousCredit) / target) * 100))
}
