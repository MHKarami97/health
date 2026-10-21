export type ActivityKind = 'walking' | 'moderate' | 'vigorous' | 'strength'

export interface ActivityLog {
  id: string
  date: string
  kind: ActivityKind
  minutes: number
  note: string
}

export var ACTIVITY_LABELS: Record<ActivityKind, string> = {
  walking: 'پیاده‌روی تند',
  moderate: 'فعالیت متوسط',
  vigorous: 'فعالیت شدید',
  strength: 'تمرین قدرتی',
}

export interface ActivityWeekSummary {
  aerobicEquivalent: number
  moderateMinutes: number
  vigorousMinutes: number
  walkingMinutes: number
  strengthDays: number
}

/** WHO: 1 vigorous minute counts as 2 moderate minutes; brisk walking is moderate. */
export class ActivityCalculator {
  static summarize(logs: ActivityLog[]): ActivityWeekSummary {
    var walking = ActivityCalculator.sum(logs, 'walking')
    var moderate = ActivityCalculator.sum(logs, 'moderate')
    var vigorous = ActivityCalculator.sum(logs, 'vigorous')
    var strengthDays = new Set(logs.filter((log) => log.kind === 'strength').map((log) => log.date)).size
    return {
      aerobicEquivalent: walking + moderate + vigorous * 2,
      moderateMinutes: moderate,
      vigorousMinutes: vigorous,
      walkingMinutes: walking,
      strengthDays,
    }
  }

  static percent(value: number, target: number): number {
    return target <= 0 ? 0 : Math.min(100, Math.round((value / target) * 100))
  }

  private static sum(logs: ActivityLog[], kind: ActivityKind): number {
    return logs.filter((log) => log.kind === kind).reduce((total, log) => total + log.minutes, 0)
  }
}
