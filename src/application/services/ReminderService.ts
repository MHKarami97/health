import { DateOnly } from '@domain/valueObjects/DateOnly'
import { BrowserNotifier } from '@infrastructure/notifications/BrowserNotifier'
import { useAppStore } from '@application/stores/appStore'
import { useToastStore } from '@application/stores/toastStore'

type AppStore = ReturnType<typeof useAppStore>
type ToastStore = ReturnType<typeof useToastStore>

var TICK_MS = 20_000
var DAY_REMINDER_TIME = '09:00'
var QUIET_START_HOUR = 22
var QUIET_END_HOUR = 8

/** In-app reminders. They fire only while the app is open; true background push needs a push server. */
export class ReminderService {
  private timer: ReturnType<typeof setInterval> | null = null
  private readonly fired = new Set<string>()
  private lastMoveAt = Date.now()

  constructor(
    private readonly store: AppStore,
    private readonly toast: ToastStore,
    private readonly notifier: BrowserNotifier = new BrowserNotifier(),
  ) {}

  start(): void {
    if (this.timer) return
    this.timer = setInterval(() => void this.tick(), TICK_MS)
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer)
    this.timer = null
  }

  private async emit(key: string, title: string, body: string): Promise<void> {
    var uniqueKey = `${this.store.todayKey}|${key}`
    if (this.fired.has(uniqueKey)) return
    this.fired.add(uniqueKey)
    this.toast.show(`${title}: ${body}`, 6000)
    await this.notifier.notify(title, body)
  }

  private async tick(): Promise<void> {
    this.store.refreshToday()
    var profile = this.store.current
    if (!profile.settings.remindersEnabled) return

    var now = new Date()
    var time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    var today = DateOnly.parse(this.store.todayKey)
    var tomorrow = today.addDays(1).value

    for (var medication of profile.medications) {
      if (medication.time === time && !medication.takenDates.includes(today.value)) {
        await this.emit(`med-${medication.id}`, 'یادآور دارو', `${medication.name} ${medication.dose}`.trim())
      }
    }

    for (var habit of this.store.visibleHabits) {
      var done = (habit.completions[profile.profile.id] ?? []).includes(today.value)
      if (habit.reminderTime === time && !done) await this.emit(`habit-${habit.id}`, 'یادآور عادت', habit.title)
    }

    for (var appointment of profile.appointments) {
      var atTime = appointment.date === today.value && appointment.time === time
      var dayBefore = appointment.date === tomorrow && time === DAY_REMINDER_TIME
      if (atTime) await this.emit(`appt-${appointment.id}-now`, 'نوبت امروز', appointment.title)
      if (dayBefore) await this.emit(`appt-${appointment.id}-before`, 'نوبت فردا', appointment.title)
    }

    for (var vaccine of profile.vaccines) {
      if (time !== DAY_REMINDER_TIME) continue
      if (vaccine.nextDate === today.value) await this.emit(`vac-${vaccine.id}-today`, 'یادآور واکسن', `امروز: ${vaccine.name}`)
      if (vaccine.nextDate === tomorrow) await this.emit(`vac-${vaccine.id}-before`, 'یادآور واکسن', `فردا: ${vaccine.name}`)
    }

    var interval = profile.settings.moveReminderMinutes
    var hour = now.getHours()
    var isQuiet = hour >= QUIET_START_HOUR || hour < QUIET_END_HOUR
    if (interval > 0 && !isQuiet && Date.now() - this.lastMoveAt >= interval * 60_000) {
      this.lastMoveAt = Date.now()
      await this.emit(`move-${Date.now()}`, 'بلند شو و حرکت کن', 'چند دقیقه راه برو یا حرکات کششی انجام بده.')
    }
  }
}
