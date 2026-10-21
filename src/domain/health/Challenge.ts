import { DateOnly } from '../valueObjects/DateOnly'

export type ChallengeKind = 'no-sweet-drinks' | 'walking-duo' | 'custom'

export interface Challenge {
  id: string
  title: string
  kind: ChallengeKind
  startDate: string
  endDate: string
  targetMinutes: number
  completions: Record<string, string[]>
}

export var CHALLENGE_LABELS: Record<ChallengeKind, string> = {
  'no-sweet-drinks': 'بدون نوشیدنی شیرین',
  'walking-duo': 'پیاده‌روی مشترک',
  custom: 'چالش دلخواه',
}

export interface ChallengeProgress {
  percent: number
  summary: string
  lines: string[]
}

export interface ProfileActivityFacts {
  profileId: string
  name: string
  walkingByDate: Record<string, number>
  sweetByDate: Record<string, number>
}

export class ChallengeEvaluator {
  constructor(private readonly today: DateOnly = DateOnly.today()) {}

  evaluate(challenge: Challenge, facts: ProfileActivityFacts[]): ChallengeProgress {
    var start = DateOnly.parse(challenge.startDate)
    var end = DateOnly.parse(challenge.endDate)
    var totalDays = Math.max(1, end.diffInDays(start) + 1)
    var last = this.today.value > end.value ? end : this.today
    var elapsed = Math.max(0, Math.min(totalDays, last.diffInDays(start) + 1))

    if (challenge.kind === 'walking-duo') return this.walking(challenge, facts, start, end)
    if (challenge.kind === 'no-sweet-drinks') return this.noSweet(facts, start, last, elapsed, totalDays)
    return this.custom(challenge, facts, totalDays)
  }

  private dates(start: DateOnly, end: DateOnly): DateOnly[] {
    var days: DateOnly[] = []
    for (var cursor = start; cursor.value <= end.value; cursor = cursor.addDays(1)) days.push(cursor)
    return days
  }

  private walking(challenge: Challenge, facts: ProfileActivityFacts[], start: DateOnly, end: DateOnly): ChallengeProgress {
    var lines = facts.map((fact) => {
      var minutes = Object.entries(fact.walkingByDate)
        .filter(([date]) => DateOnly.parse(date).isBetween(start, end))
        .reduce((total, [, value]) => total + value, 0)
      return { name: fact.name, minutes }
    })
    var total = lines.reduce((sum, line) => sum + line.minutes, 0)
    var percent = challenge.targetMinutes > 0 ? Math.min(100, Math.round((total / challenge.targetMinutes) * 100)) : 0
    return {
      percent,
      summary: `${total} از ${challenge.targetMinutes} دقیقه`,
      lines: lines.map((line) => `${line.name}: ${line.minutes} دقیقه`),
    }
  }

  private noSweet(facts: ProfileActivityFacts[], start: DateOnly, last: DateOnly, elapsed: number, total: number): ChallengeProgress {
    var days = elapsed > 0 ? this.dates(start, last) : []
    var lines = facts.map((fact) => {
      var broken = days.filter((day) => (fact.sweetByDate[day.value] ?? 0) > 0).length
      return `${fact.name}: ${elapsed - broken} روز بدون نوشیدنی شیرین، ${broken} روز ثبت‌شده`
    })
    return { percent: Math.round((elapsed / total) * 100), summary: `روز ${elapsed} از ${total}`, lines }
  }

  private custom(challenge: Challenge, facts: ProfileActivityFacts[], total: number): ChallengeProgress {
    var lines = facts.map((fact) => `${fact.name}: ${(challenge.completions[fact.profileId] ?? []).length} از ${total} روز`)
    var done = facts.reduce((sum, fact) => sum + (challenge.completions[fact.profileId] ?? []).length, 0)
    var percent = Math.round((done / Math.max(1, total * Math.max(1, facts.length))) * 100)
    return { percent: Math.min(100, percent), summary: `${percent}٪ تکمیل`, lines }
  }
}
