import type { useHealthStore } from '@application/stores/healthStore'
import { MEAL_LABELS_FA, FOOD_TAG_LABELS_FA } from '@domain/health/NutritionLog'
import { ACTIVITY_LABELS_FA } from '@domain/health/ActivityLog'
import { MEASUREMENT_LABELS_FA } from '@domain/health/HealthRecord'

type HealthStore = ReturnType<typeof useHealthStore>

export class HealthReportService {
  build(store: HealthStore): string {
    var nutrition = store.nutritionLogs
      .slice(0, 20)
      .map((log) => `<tr><td>${log.date}</td><td>${MEAL_LABELS_FA[log.meal]}</td><td>${log.description}</td><td>${log.tags.map((tag) => FOOD_TAG_LABELS_FA[tag]).join('، ') || '—'}</td></tr>`)
      .join('')

    var activity = store.activityLogs
      .slice(0, 20)
      .map((log) => `<tr><td>${log.date}</td><td>${ACTIVITY_LABELS_FA[log.intensity]}</td><td>${log.minutes} دقیقه</td><td>${log.note || '—'}</td></tr>`)
      .join('')

    var measurements = store.measurements
      .slice(0, 20)
      .map((item) => `<tr><td>${item.date}</td><td>${MEASUREMENT_LABELS_FA[item.type]}</td><td>${item.value}${item.secondaryValue ? ` / ${item.secondaryValue}` : ''} ${item.unit}</td></tr>`)
      .join('')

    return `
      <h1>گزارش سلامت</h1>
      <p>تاریخ تولید: ${new Date().toLocaleString('fa-IR')}</p>
      <p class="warning">این گزارش جایگزین توصیهٔ پزشک نیست.</p>
      <h2>تغذیه</h2>
      <table><thead><tr><th>تاریخ</th><th>وعده</th><th>شرح</th><th>برچسب‌ها</th></tr></thead><tbody>${nutrition}</tbody></table>
      <h2>فعالیت</h2>
      <table><thead><tr><th>تاریخ</th><th>نوع</th><th>مدت</th><th>یادداشت</th></tr></thead><tbody>${activity}</tbody></table>
      <h2>اندازه‌گیری‌ها</h2>
      <table><thead><tr><th>تاریخ</th><th>نوع</th><th>مقدار</th></tr></thead><tbody>${measurements}</tbody></table>
    `
  }

  print(store: HealthStore): void {
    var win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <html dir="rtl"><head><meta charset="utf-8"><title>گزارش سلامت</title>
      <style>body{font-family:Tahoma;padding:24px}table{width:100%;border-collapse:collapse;margin-bottom:24px}th,td{border:1px solid #ccc;padding:8px;text-align:right}h1{color:#0f766e}.warning{color:#b45309}</style>
      </head><body>${this.build(store)}</body></html>`)
    win.document.close()
    win.print()
  }
}
