import { DateOnly } from '../valueObjects/DateOnly'
import type { Profile } from './Profile'
import type { SourceRef } from './Sources'
import { SOURCES } from './Sources'

export type CheckupId = 'blood-pressure' | 'cholesterol' | 'eye' | 'skin' | 'vaccines'

export interface CheckupDefinition {
  id: CheckupId
  title: string
  defaultMonths: number
  rule: string
  source: SourceRef
  sourceBacked: boolean
}

export interface CheckupRecord {
  lastDate: string | null
  intervalMonths: number
}

export type CheckupStatus = 'never' | 'ok' | 'soon' | 'overdue' | 'not-applicable'

export interface CheckupView {
  definition: CheckupDefinition
  record: CheckupRecord
  nextDate: DateOnly | null
  status: CheckupStatus
  note: string
}

export var CHECKUPS: CheckupDefinition[] = [
  {
    id: 'blood-pressure',
    title: 'فشار خون',
    defaultMonths: 12,
    rule: 'برای همهٔ بزرگسالان هر ۱ تا ۲ سال',
    source: SOURCES.clevelandGuidelines,
    sourceBacked: true,
  },
  {
    id: 'cholesterol',
    title: 'کلسترول (پروفایل چربی)',
    defaultMonths: 60,
    rule: 'مردان از ۳۵ سالگی و زنان از ۴۵ سالگی، هر ۵ سال یا بنا به نتیجه و ریسک',
    source: SOURCES.clevelandGuidelines,
    sourceBacked: true,
  },
  {
    id: 'eye',
    title: 'معاینهٔ چشم',
    defaultMonths: 24,
    rule: 'در فهرست استاندارد چکاپ بزرگسالان آمده، اما بازهٔ دقیق را پزشک تعیین می‌کند',
    source: SOURCES.hopkinsScreenings,
    sourceBacked: false,
  },
  {
    id: 'skin',
    title: 'معاینهٔ پوست',
    defaultMonths: 12,
    rule: 'در فهرست استاندارد چکاپ بزرگسالان آمده، اما بازهٔ دقیق را پزشک تعیین می‌کند',
    source: SOURCES.hopkinsScreenings,
    sourceBacked: false,
  },
  {
    id: 'vaccines',
    title: 'بررسی واکسن‌ها',
    defaultMonths: 12,
    rule: 'آنفلوآنزا سالانه و کزاز/دیفتری هر ۱۰ سال (برای بزرگسالان ۱۹ سال به بالا)',
    source: SOURCES.clevelandGuidelines,
    sourceBacked: true,
  },
]

export var defaultCheckupRecords = (): Record<CheckupId, CheckupRecord> => {
  var records = {} as Record<CheckupId, CheckupRecord>
  CHECKUPS.forEach((item) => {
    records[item.id] = { lastDate: null, intervalMonths: item.defaultMonths }
  })
  return records
}

export class CheckupPlanner {
  constructor(
    private readonly profile: Profile,
    private readonly records: Record<CheckupId, CheckupRecord>,
    private readonly today: DateOnly = DateOnly.today(),
  ) {}

  plan(): CheckupView[] {
    return CHECKUPS.map((definition) => this.evaluate(definition))
  }

  private age(): number | null {
    return this.profile.birthYear ? this.today.toDate().getFullYear() - this.profile.birthYear : null
  }

  private evaluate(definition: CheckupDefinition): CheckupView {
    var record = this.records[definition.id] ?? { lastDate: null, intervalMonths: definition.defaultMonths }
    var eligibility = this.eligibility(definition.id)
    if (eligibility) {
      return { definition, record, nextDate: null, status: 'not-applicable', note: eligibility }
    }
    var last = DateOnly.tryParse(record.lastDate)
    if (!last) return { definition, record, nextDate: null, status: 'never', note: 'هنوز ثبت نشده' }

    var nextDate = last.addMonths(record.intervalMonths)
    var daysLeft = nextDate.diffInDays(this.today)
    var status: CheckupStatus = daysLeft < 0 ? 'overdue' : daysLeft <= 30 ? 'soon' : 'ok'
    return { definition, record, nextDate, status, note: '' }
  }

  private eligibility(id: CheckupId): string | null {
    if (id !== 'cholesterol') return null
    var age = this.age()
    if (age === null || this.profile.sex === 'unspecified') return null
    var start = this.profile.sex === 'male' ? 35 : 45
    return age < start ? `طبق راهنما شروع از ${start} سالگی است (مگر پزشک ریسک بالا تشخیص دهد)` : null
  }
}
