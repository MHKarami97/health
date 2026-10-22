import { JalaliCalendar } from './JalaliCalendar'

var DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
var MS_PER_DAY = 86_400_000
var PERSIAN_FORMAT = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { dateStyle: 'medium' })

export class DateOnly {
  private constructor(readonly value: string) {}

  static today(): DateOnly {
    return DateOnly.fromDate(new Date())
  }

  static fromDate(date: Date): DateOnly {
    var month = String(date.getMonth() + 1).padStart(2, '0')
    var day = String(date.getDate()).padStart(2, '0')
    return new DateOnly(`${date.getFullYear()}-${month}-${day}`)
  }

  static parse(value: string): DateOnly {
    if (!DATE_PATTERN.test(value)) throw new Error('تاریخ نامعتبر است')
    return new DateOnly(value)
  }

  static tryParse(value: string | null | undefined): DateOnly | null {
    if (!value) return null
    try {
      return DateOnly.parse(value)
    } catch {
      return null
    }
  }

  toDate(): Date {
    var parts = this.value.split('-').map(Number)
    return new Date(parts[0], parts[1] - 1, parts[2])
  }

  addDays(days: number): DateOnly {
    var date = this.toDate()
    date.setDate(date.getDate() + days)
    return DateOnly.fromDate(date)
  }

  /** Adds Jalali (Persian calendar) months; the day is clamped to the target month length. */
  addMonths(months: number): DateOnly {
    var date = this.toDate()
    var jalali = JalaliCalendar.fromGregorian(date.getFullYear(), date.getMonth() + 1, date.getDate())
    return DateOnly.parse(JalaliCalendar.toIso(JalaliCalendar.addMonths(jalali, months)))
  }

  /** Iranian week starts on Saturday. */
  startOfWeek(): DateOnly {
    return this.addDays(-((this.toDate().getDay() + 1) % 7))
  }

  diffInDays(other: DateOnly): number {
    return Math.round((this.toDate().getTime() - other.toDate().getTime()) / MS_PER_DAY)
  }

  isBetween(start: DateOnly, end: DateOnly): boolean {
    return this.value >= start.value && this.value <= end.value
  }

  toPersian(): string {
    return PERSIAN_FORMAT.format(this.toDate())
  }

  toString(): string {
    return this.value
  }
}

export var persianDate = (value: string): string => DateOnly.tryParse(value)?.toPersian() ?? value
