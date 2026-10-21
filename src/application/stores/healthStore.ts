import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { DateOnly } from '@domain/valueObjects/DateOnly'
import type { NutritionLog, MealType, FoodTag } from '@domain/health/NutritionLog'
import type { ActivityLog, ActivityIntensity } from '@domain/health/ActivityLog'
import type { Measurement, Medication, Appointment, Vaccine, MeasurementType } from '@domain/health/HealthRecord'
import type { Habit, DailyCheckIn } from '@domain/health/Habit'
import { DEFAULT_HEALTH_GOALS, type HealthGoals } from '@domain/health/HealthGoals'
import { activityProgress, summarizeActivity, summarizeNutrition } from '@domain/health/HealthWeeklySummary'
import { LocalStorageRepository } from '@infrastructure/storage/LocalStorageRepository'

var storage = new LocalStorageRepository()
var STORAGE_KEY = 'salamat-state-v1'

interface SalamatState {
  nutritionLogs: NutritionLog[]
  activityLogs: ActivityLog[]
  measurements: Measurement[]
  medications: Medication[]
  appointments: Appointment[]
  vaccines: Vaccine[]
  habits: Habit[]
  checkIns: DailyCheckIn[]
  goals: HealthGoals
}

var today = DateOnly.today().toString()

var createId = (): string =>
  (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`)

export var useHealthStore = defineStore('health', () => {
  var nutritionLogs = ref<NutritionLog[]>([])
  var activityLogs = ref<ActivityLog[]>([])
  var measurements = ref<Measurement[]>([])
  var medications = ref<Medication[]>([])
  var appointments = ref<Appointment[]>([])
  var vaccines = ref<Vaccine[]>([])
  var habits = ref<Habit[]>([])
  var checkIns = ref<DailyCheckIn[]>([])
  var goals = ref<HealthGoals>({ ...DEFAULT_HEALTH_GOALS })

  function hydrate(): void {
    var state = storage.load<SalamatState | null>(STORAGE_KEY, null)
    if (!state) return
    nutritionLogs.value = state.nutritionLogs ?? []
    activityLogs.value = state.activityLogs ?? []
    measurements.value = state.measurements ?? []
    medications.value = state.medications ?? []
    appointments.value = state.appointments ?? []
    vaccines.value = state.vaccines ?? []
    habits.value = state.habits ?? []
    checkIns.value = state.checkIns ?? []
    goals.value = { ...DEFAULT_HEALTH_GOALS, ...state.goals }
  }

  function persist(): void {
    var state: SalamatState = {
      nutritionLogs: nutritionLogs.value,
      activityLogs: activityLogs.value,
      measurements: measurements.value,
      medications: medications.value,
      appointments: appointments.value,
      vaccines: vaccines.value,
      habits: habits.value,
      checkIns: checkIns.value,
      goals: goals.value,
    }
    storage.save(STORAGE_KEY, state)
  }

  hydrate()
  watch([nutritionLogs, activityLogs, measurements, medications, appointments, vaccines, habits, checkIns, goals], persist, { deep: true })

  var weekStart = computed(() => {
    var now = new Date()
    var day = (now.getDay() + 1) % 7
    now.setDate(now.getDate() - day)
    return now.toISOString().slice(0, 10)
  })

  var weeklyNutritionLogs = computed(() =>
    nutritionLogs.value.filter((log) => log.date >= weekStart.value),
  )

  var weeklyActivityLogs = computed(() =>
    activityLogs.value.filter((log) => log.date >= weekStart.value),
  )

  var nutritionSummary = computed(() => summarizeNutrition(weeklyNutritionLogs.value))
  var activitySummary = computed(() => summarizeActivity(weeklyActivityLogs.value))
  var activityPercentage = computed(() => activityProgress(activitySummary.value))

  function addNutritionLog(meal: MealType, description: string, tags: FoodTag[], waterGlasses = 0, sweetDrinks = 0): void {
    nutritionLogs.value.unshift({
      id: createId(),
      date: today,
      meal,
      description,
      tags,
      waterGlasses,
      sweetDrinks,
    })
  }

  function addActivityLog(intensity: ActivityIntensity, minutes: number, note = ''): void {
    if (minutes <= 0) throw new Error('مدت فعالیت باید بیشتر از صفر باشد')
    activityLogs.value.unshift({ id: createId(), date: today, intensity, minutes, note })
  }

  function addMeasurement(type: MeasurementType, value: number, secondaryValue?: number): void {
    var unit = type === 'blood-pressure' ? 'mmHg' : type === 'weight' ? 'kg' : type === 'blood-sugar' ? 'mg/dL' : 'cm'
    measurements.value.unshift({ id: createId(), date: today, type, value, secondaryValue, unit })
  }

  function addMedication(name: string, time: string): void {
    medications.value.push({ id: createId(), name, time, takenToday: false })
  }

  function toggleMedication(id: string): void {
    var medication = medications.value.find((item) => item.id === id)
    if (medication) medication.takenToday = !medication.takenToday
  }

  function addAppointment(title: string, date: string, note = ''): void {
    appointments.value.push({ id: createId(), title, date, note })
  }

  function addVaccine(name: string, nextDate: string): void {
    vaccines.value.push({ id: createId(), name, nextDate })
  }

  function addHabit(title: string): void {
    habits.value.push({ id: createId(), title, completedDates: [] })
  }

  function toggleHabit(id: string, date = today): void {
    var habit = habits.value.find((item) => item.id === id)
    if (!habit) return
    habit.completedDates = habit.completedDates.includes(date)
      ? habit.completedDates.filter((item) => item !== date)
      : [...habit.completedDates, date]
  }

  function saveCheckIn(checkIn: DailyCheckIn): void {
    var index = checkIns.value.findIndex((item) => item.date === checkIn.date)
    if (index >= 0) checkIns.value[index] = checkIn
    else checkIns.value.unshift(checkIn)
  }

  function updateGoals(next: HealthGoals): void {
    goals.value = { ...next }
  }

  function exportJson(): void {
    var blob = new Blob([JSON.stringify({ goals: goals.value, nutritionLogs: nutritionLogs.value, activityLogs: activityLogs.value, measurements: measurements.value }, null, 2)], { type: 'application/json' })
    var url = URL.createObjectURL(blob)
    var link = document.createElement('a')
    link.href = url
    link.download = `salamat-${today}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return {
    nutritionLogs, activityLogs, measurements, medications, appointments, vaccines, habits, checkIns, goals,
    nutritionSummary, activitySummary, activityPercentage, weekStart,
    addNutritionLog, addActivityLog, addMeasurement, addMedication, toggleMedication,
    addAppointment, addVaccine, addHabit, toggleHabit, saveCheckIn, updateGoals, exportJson,
  }
})
