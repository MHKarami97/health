import { describe, expect, it } from 'vitest'
import { JalaliCalendar } from './JalaliCalendar'

var persian = new Intl.DateTimeFormat('en-u-ca-persian-nu-latn', { year: 'numeric', month: 'numeric', day: 'numeric', timeZone: 'UTC' })

describe('JalaliCalendar', () => {
  it.each([
    ['2024-03-20', 1403, 1, 1],
    ['2026-03-21', 1405, 1, 1],
    ['2026-10-22', 1405, 7, 30],
  ])('converts %s', (iso, year, month, day) => {
    expect(JalaliCalendar.fromIso(iso)).toEqual({ year, month, day })
    expect(JalaliCalendar.toIso({ year, month, day })).toBe(iso)
  })

  it('matches Intl persian calendar and round-trips every day from 1990 to 2060', () => {
    for (var time = Date.UTC(1990, 0, 1); time < Date.UTC(2060, 0, 1); time += 86_400_000) {
      var date = new Date(time)
      var expected = Object.fromEntries(persian.formatToParts(date).map((part) => [part.type, Number(part.value)]))
      var actual = JalaliCalendar.fromGregorian(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate())
      expect([actual.year, actual.month, actual.day]).toEqual([expected.year ?? expected.relatedYear, expected.month, expected.day])
      expect(JalaliCalendar.toIso(actual)).toBe(date.toISOString().slice(0, 10))
    }
  })

  it('knows leap years and month lengths', () => {
    expect(JalaliCalendar.daysInMonth(1403, 12)).toBe(30)
    expect(JalaliCalendar.daysInMonth(1404, 12)).toBe(29)
    expect(JalaliCalendar.daysInMonth(1405, 6)).toBe(31)
  })

  it('rejects empty and impossible dates', () => {
    expect(JalaliCalendar.fromIso('')).toBeNull()
    expect(JalaliCalendar.fromIso('2026-02-30')).toBeNull()
  })
})
