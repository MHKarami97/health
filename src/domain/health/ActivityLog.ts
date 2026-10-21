export type ActivityIntensity = 'moderate' | 'vigorous' | 'strength' | 'walking'

export interface ActivityLog {
  id: string
  date: string
  intensity: ActivityIntensity
  minutes: number
  note: string
}

export const ACTIVITY_LABELS_FA: Record<ActivityIntensity, string> = {
  moderate: 'متوسط',
  vigorous: 'شدید',
  strength: 'قدرتی',
  walking: 'پیاده‌روی',
}
