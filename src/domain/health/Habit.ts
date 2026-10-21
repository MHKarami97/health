import { DateOnly } from '../valueObjects/DateOnly'

export type HabitScope = 'personal' | 'shared'

export interface Habit {
  id: string
  title: string
  scope: HabitScope
  ownerId: string | null
  reminderTime: string | null
  completions: Record<string, string[]>
}

export interface DailyCheckIn {
  date: string
  mood: number
  energy: number
  pain: number
  stress: number
  sleepStart: string
  sleepEnd: string
  screenHours: number
  sittingBreaks: number
}

export class HabitStreak {
  static current(dates: string[], today: DateOnly = DateOnly.today()): number {
    var set = new Set(dates)
    var cursor = set.has(today.value) ? today : today.addDays(-1)
    var count = 0
    while (set.has(cursor.value)) {
      count += 1
      cursor = cursor.addDays(-1)
    }
    return count
  }
}

export class SleepCalculator {
  static hours(start: string, end: string): number {
    var s = SleepCalculator.minutes(start)
    var e = SleepCalculator.minutes(end)
    var diff = e >= s ? e - s : e + 1440 - s
    return Math.round((diff / 60) * 10) / 10
  }

  private static minutes(time: string): number {
    var parts = time.split(':').map(Number)
    return parts[0] * 60 + (parts[1] || 0)
  }
}
