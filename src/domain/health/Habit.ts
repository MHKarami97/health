export interface Habit {
  id: string
  title: string
  completedDates: string[]
}

export interface DailyCheckIn {
  date: string
  mood: number
  energy: number
  pain: number
  stress: number
  sleepStart: string
  sleepEnd: string
  screenBreaks: number
}
