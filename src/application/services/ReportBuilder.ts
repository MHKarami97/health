import { escapeHtml } from '@infrastructure/export/PrintReportService'
import { DateOnly, persianDate } from '@domain/valueObjects/DateOnly'
import type { ProfileData } from '@domain/health/AppData'
import { APPOINTMENT_LABELS, MEASUREMENT_LABELS } from '@domain/health/Medical'
import type { CheckupView } from '@domain/health/Checkups'

var STATUS_LABELS: Record<CheckupView['status'], string> = {
  never: 'ثبت نشده',
  ok: 'به‌روز',
  soon: 'نزدیک موعد',
  overdue: 'گذشته از موعد',
  'not-applicable': 'طبق راهنما هنوز لازم نیست',
}

export class ReportBuilder {
  build(data: ProfileData, checkups: CheckupView[]): string {
    var e = escapeHtml
    var file = data.healthFile
    var rows = (cells: string[][]): string =>
      cells.length
        ? cells.map((row) => `<tr>${row.map((cell) => `<td>${e(cell)}</td>`).join('')}</tr>`).join('')
        : '<tr><td colspan="9">موردی ثبت نشده</td></tr>'

    var measurements = data.measurements.slice(0, 40).map((item) => [
      persianDate(item.date),
      item.type === 'other' ? item.label || MEASUREMENT_LABELS.other : MEASUREMENT_LABELS[item.type],
      `${item.value}${item.secondary ? ` / ${item.secondary}` : ''} ${item.unit}`,
    ])

    return `
      <h1>گزارش سلامت - ${e(data.profile.name)}</h1>
      <p class="muted">تاریخ تهیه: ${e(persianDate(DateOnly.today().value))}</p>
      <p class="warn">این گزارش را خود فرد ثبت کرده و جایگزین توصیه یا تشخیص پزشک نیست.</p>

      <h2>پروندهٔ سلامت</h2>
      <table><tbody>
        <tr><th>گروه خونی</th><td>${e(file.bloodType || '—')}</td></tr>
        <tr><th>آلرژی‌ها</th><td>${e(file.allergies || '—')}</td></tr>
        <tr><th>بیماری‌ها / شرایط</th><td>${e(file.conditions || '—')}</td></tr>
      </tbody></table>

      <h2>پزشکان</h2>
      <table><thead><tr><th>نام</th><th>تخصص</th><th>تلفن</th></tr></thead>
      <tbody>${rows(file.doctors.map((d) => [d.name, d.specialty, d.phone]))}</tbody></table>

      <h2>داروها و ویتامین‌ها</h2>
      <table><thead><tr><th>نام</th><th>مقدار</th><th>نوع</th><th>ساعت</th></tr></thead>
      <tbody>${rows(data.medications.map((m) => [m.name, m.dose, m.kind === 'drug' ? 'دارو' : 'ویتامین', m.time]))}</tbody></table>

      <h2>نتایج آزمایش و اندازه‌گیری‌ها</h2>
      <table><thead><tr><th>تاریخ</th><th>مورد</th><th>مقدار</th></tr></thead><tbody>${rows(measurements)}</tbody></table>

      <h2>نوبت‌ها</h2>
      <table><thead><tr><th>تاریخ</th><th>نوع</th><th>عنوان</th></tr></thead>
      <tbody>${rows(data.appointments.map((a) => [persianDate(a.date), APPOINTMENT_LABELS[a.kind], a.title]))}</tbody></table>

      <h2>واکسن‌ها</h2>
      <table><thead><tr><th>واکسن</th><th>آخرین نوبت</th><th>نوبت بعدی</th></tr></thead>
      <tbody>${rows(data.vaccines.map((v) => [v.name, persianDate(v.lastDate), persianDate(v.nextDate)]))}</tbody></table>

      <h2>وضعیت چکاپ‌ها</h2>
      <table><thead><tr><th>مورد</th><th>آخرین انجام</th><th>وضعیت</th></tr></thead>
      <tbody>${rows(checkups.map((c) => [c.definition.title, c.record.lastDate ? persianDate(c.record.lastDate) : '—', STATUS_LABELS[c.status]]))}</tbody></table>
    `
  }
}
