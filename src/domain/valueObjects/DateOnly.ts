export class DateOnly {
  private constructor(readonly value: string) {}

  static today(): DateOnly {
    return new DateOnly(new Date().toISOString().slice(0, 10))
  }

  static from(value: string): DateOnly {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new Error('تاریخ نامعتبر است')
    }
    return new DateOnly(value)
  }

  equals(other: DateOnly): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
