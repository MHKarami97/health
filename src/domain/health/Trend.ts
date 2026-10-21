export class Trend {
  static average(values: number[]): number | null {
    return values.length ? Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10 : null
  }

  /** Difference between the recent window average and the previous window average. */
  static change(recent: number[], previous: number[]): number | null {
    var a = Trend.average(recent)
    var b = Trend.average(previous)
    return a === null || b === null ? null : Math.round((a - b) * 10) / 10
  }
}
