interface YearInfo {
  leap: number
  gregorianYear: number
  march: number
}

export interface JalaliDate {
  readonly year: number
  readonly month: number
  readonly day: number
}

var BREAKS = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178]
var ISO_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/
var PERSIAN_DIGITS = new Intl.NumberFormat('fa-IR', { useGrouping: false })

var div = (a: number, b: number): number => Math.trunc(a / b)
var mod = (a: number, b: number): number => a - div(a, b) * b

/** Jalali <-> Gregorian conversion (Borkowski arithmetic algorithm, as used by jalaali-js). Valid for Jalali years -61..3177. */
export class JalaliCalendar {
  static readonly minYear = 1300
  static readonly maxYear = 1500
  static readonly monthNames = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'] as const
  static readonly weekdayLabels = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'] as const

  static today(): JalaliDate {
    var now = new Date()
    return JalaliCalendar.fromGregorian(now.getFullYear(), now.getMonth() + 1, now.getDate())
  }

  /** Accepts the ISO yyyy-MM-dd string used by DateOnly. Returns null for empty or impossible dates. */
  static fromIso(iso: string | null | undefined): JalaliDate | null {
    var match = ISO_PATTERN.exec(iso ?? '')
    if (!match) return null
    var year = Number(match[1])
    var month = Number(match[2])
    var day = Number(match[3])
    var probe = new Date(Date.UTC(year, month - 1, day))
    var isReal = probe.getUTCFullYear() === year && probe.getUTCMonth() === month - 1 && probe.getUTCDate() === day
    return isReal ? JalaliCalendar.fromGregorian(year, month, day) : null
  }

  static toIso(date: JalaliDate): string {
    var gregorian = JalaliCalendar.toGregorian(date.year, date.month, date.day)
    var pad = (value: number): string => String(value).padStart(2, '0')
    return `${String(gregorian.year).padStart(4, '0')}-${pad(gregorian.month)}-${pad(gregorian.day)}`
  }

  /** Moves by Jalali months and clamps the day to the target month length (e.g. 30 Esfand + 12 months in a non-leap year -> 29 Esfand). */
  static addMonths(date: JalaliDate, months: number): JalaliDate {
    var index = date.year * 12 + (date.month - 1) + months
    var year = Math.floor(index / 12)
    var month = index - year * 12 + 1
    return { year, month, day: Math.min(date.day, JalaliCalendar.daysInMonth(year, month)) }
  }

  static fromGregorian(year: number, month: number, day: number): JalaliDate {
    return JalaliCalendar.dayNumberToJalali(JalaliCalendar.gregorianToDayNumber(year, month, day))
  }

  static toGregorian(year: number, month: number, day: number): JalaliDate {
    return JalaliCalendar.dayNumberToGregorian(JalaliCalendar.jalaliToDayNumber(year, month, day))
  }

  static isLeapYear(year: number): boolean {
    return JalaliCalendar.yearInfo(year).leap === 0
  }

  static daysInMonth(year: number, month: number): number {
    if (month <= 6) return 31
    if (month <= 11) return 30
    return JalaliCalendar.isLeapYear(year) ? 30 : 29
  }

  /** 0 = Saturday ... 6 = Friday, matching the Iranian week. */
  static firstWeekdayIndex(year: number, month: number): number {
    var first = JalaliCalendar.toGregorian(year, month, 1)
    var sundayBased = new Date(Date.UTC(first.year, first.month - 1, first.day)).getUTCDay()
    return (sundayBased + 1) % 7
  }

  static digits(value: number): string {
    return PERSIAN_DIGITS.format(value)
  }

  static format(date: JalaliDate): string {
    var pad = (value: number): string => (value < 10 ? '۰' : '') + JalaliCalendar.digits(value)
    return `${JalaliCalendar.digits(date.year)}/${pad(date.month)}/${pad(date.day)}`
  }

  private static yearInfo(jalaliYear: number): YearInfo {
    var last = BREAKS.length - 1
    if (jalaliYear < BREAKS[0] || jalaliYear >= BREAKS[last]) throw new RangeError(`Invalid Jalali year ${jalaliYear}`)

    var gregorianYear = jalaliYear + 621
    var leapJalali = -14
    var previous = BREAKS[0]
    var jump = 0
    for (var index = 1; index <= last; index++) {
      var current = BREAKS[index]
      jump = current - previous
      if (jalaliYear < current) break
      leapJalali += div(jump, 33) * 8 + div(mod(jump, 33), 4)
      previous = current
    }

    var elapsed = jalaliYear - previous
    leapJalali += div(elapsed, 33) * 8 + div(mod(elapsed, 33) + 3, 4)
    if (mod(jump, 33) === 4 && jump - elapsed === 4) leapJalali += 1

    var leapGregorian = div(gregorianYear, 4) - div((div(gregorianYear, 100) + 1) * 3, 4) - 150
    var march = 20 + leapJalali - leapGregorian

    if (jump - elapsed < 6) elapsed = elapsed - jump + div(jump + 4, 33) * 33
    var leap = mod(mod(elapsed + 1, 33) - 1, 4)
    if (leap === -1) leap = 4
    return { leap, gregorianYear, march }
  }

  private static jalaliToDayNumber(year: number, month: number, day: number): number {
    var info = JalaliCalendar.yearInfo(year)
    return JalaliCalendar.gregorianToDayNumber(info.gregorianYear, 3, info.march) + (month - 1) * 31 - div(month, 7) * (month - 7) + day - 1
  }

  private static dayNumberToJalali(dayNumber: number): JalaliDate {
    var gregorianYear = JalaliCalendar.dayNumberToGregorian(dayNumber).year
    var year = gregorianYear - 621
    var info = JalaliCalendar.yearInfo(year)
    var newYearDay = JalaliCalendar.gregorianToDayNumber(gregorianYear, 3, info.march)
    var offset = dayNumber - newYearDay

    if (offset >= 0) {
      if (offset <= 185) return { year, month: 1 + div(offset, 31), day: mod(offset, 31) + 1 }
      offset -= 186
    } else {
      year -= 1
      offset += 179
      if (info.leap === 1) offset += 1
    }
    return { year, month: 7 + div(offset, 30), day: mod(offset, 30) + 1 }
  }

  private static gregorianToDayNumber(year: number, month: number, day: number): number {
    var shifted = year + div(month - 8, 6) + 100100
    var result = div(shifted * 1461, 4) + div(153 * mod(month + 9, 12) + 2, 5) + day - 34840408
    return result - div(div(shifted, 100) * 3, 4) + 752
  }

  private static dayNumberToGregorian(dayNumber: number): JalaliDate {
    var j = 4 * dayNumber + 139361631
    j += div(div(4 * dayNumber + 183187720, 146097) * 3, 4) * 4 - 3908
    var i = div(mod(j, 1461), 4) * 5 + 308
    var day = div(mod(i, 153), 5) + 1
    var month = mod(div(i, 153), 12) + 1
    var year = div(j, 1461) - 100100 + div(8 - month, 6)
    return { year, month, day }
  }
}
