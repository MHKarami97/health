import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { DateOnly } from '@domain/valueObjects/DateOnly'
import {
  createDefaultAppData, createProfileData, normalizeAppData,
  type AppData, type ProfileData, type SharedShoppingItem,
} from '@domain/health/AppData'
import type { FoodTag, MealType } from '@domain/health/NutritionLog'
import { ActivityCalculator, type ActivityKind } from '@domain/health/ActivityLog'
import type { AppointmentKind, MeasurementType } from '@domain/health/Medical'
import { MEASUREMENT_UNITS } from '@domain/health/Medical'
import type { HealthGoals } from '@domain/health/Goals'
import type { HealthFile, Profile, ProfileSettings } from '@domain/health/Profile'
import { CheckupPlanner, type CheckupId } from '@domain/health/Checkups'
import type { DailyCheckIn, Habit, HabitScope } from '@domain/health/Habit'
import type { Challenge, ChallengeKind, ProfileActivityFacts } from '@domain/health/Challenge'
import { LocalStorageRepository } from '@infrastructure/storage/LocalStorageRepository'
import { newId } from '@infrastructure/ids'

var STORAGE_KEY = 'salamat-data-v1'
var SAVE_DELAY_MS = 300

export var useAppStore = defineStore('app', () => {
  var repository = new LocalStorageRepository()
  var data = ref<AppData>(normalizeAppData(repository.load<Partial<AppData> | null>(STORAGE_KEY, null)))
  var todayKey = ref(DateOnly.today().value)
  var saveTimer: ReturnType<typeof setTimeout> | null = null

  function flush(): void {
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = null
    repository.save(STORAGE_KEY, data.value)
  }

  watch(data, () => {
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(flush, SAVE_DELAY_MS)
  }, { deep: true })

  if (typeof window !== 'undefined') window.addEventListener('pagehide', flush)

  // ---------- derived ----------
  var current = computed<ProfileData>(() => data.value.profiles[data.value.activeProfileId])
  var profiles = computed<Profile[]>(() => Object.values(data.value.profiles).map((item) => item.profile))
  var shared = computed(() => data.value.shared)
  var weekStart = computed(() => DateOnly.parse(todayKey.value).startOfWeek().value)

  var weekNutrition = computed(() => current.value.nutritionLogs.filter((log) => log.date >= weekStart.value))
  var weekActivity = computed(() => current.value.activityLogs.filter((log) => log.date >= weekStart.value))
  var weekDrinks = computed(() => current.value.drinkLogs.filter((log) => log.date >= weekStart.value))
  var todayDrinks = computed(() => current.value.drinkLogs.find((log) => log.date === todayKey.value) ?? { date: todayKey.value, water: 0, sweet: 0 })

  var tagCounts = computed(() => {
    var counts: Record<FoodTag, number> = {
      'high-sugar': 0, 'high-salt': 0, fried: 0, processed: 0, fruit: 0, vegetables: 0, 'unsaturated-fat': 0,
    }
    weekNutrition.value.forEach((log) => log.tags.forEach((tag) => { counts[tag] += 1 }))
    return counts
  })
  var weekSweetDrinks = computed(() => weekDrinks.value.reduce((total, log) => total + log.sweet, 0))
  var todayCalories = computed(() =>
    current.value.nutritionLogs.filter((log) => log.date === todayKey.value).reduce((total, log) => total + (log.calories ?? 0), 0),
  )
  var activitySummary = computed(() => ActivityCalculator.summarize(weekActivity.value))
  var checkupViews = computed(() => new CheckupPlanner(current.value.profile, current.value.checkups, DateOnly.parse(todayKey.value)).plan())

  var visibleHabits = computed<Habit[]>(() =>
    shared.value.habits.filter((habit) => habit.scope === 'shared' || habit.ownerId === current.value.profile.id),
  )

  var challengeFacts = computed<ProfileActivityFacts[]>(() =>
    Object.values(data.value.profiles).map((item) => {
      var walkingByDate: Record<string, number> = {}
      item.activityLogs.filter((log) => log.kind === 'walking').forEach((log) => {
        walkingByDate[log.date] = (walkingByDate[log.date] ?? 0) + log.minutes
      })
      var sweetByDate: Record<string, number> = {}
      item.drinkLogs.forEach((log) => { sweetByDate[log.date] = log.sweet })
      return { profileId: item.profile.id, name: item.profile.name, walkingByDate, sweetByDate }
    }),
  )

  // ---------- helpers ----------
  function refreshToday(): void {
    todayKey.value = DateOnly.today().value
  }

  function drinkEntry() {
    var entry = current.value.drinkLogs.find((log) => log.date === todayKey.value)
    if (entry) return entry
    var created = { date: todayKey.value, water: 0, sweet: 0 }
    current.value.drinkLogs.push(created)
    return current.value.drinkLogs[current.value.drinkLogs.length - 1] ?? created
  }

  // ---------- profiles ----------
  function addProfile(name: string): void {
    var id = newId()
    data.value.profiles[id] = createProfileData(id, name.trim() || 'پروفایل جدید')
    data.value.activeProfileId = id
  }

  function setActiveProfile(id: string): void {
    if (data.value.profiles[id]) data.value.activeProfileId = id
  }

  function updateProfile(patch: Partial<Omit<Profile, 'id'>>): void {
    Object.assign(current.value.profile, patch)
  }

  function removeProfile(id: string): void {
    if (Object.keys(data.value.profiles).length <= 1) throw new Error('حداقل یک پروفایل باید بماند')
    delete data.value.profiles[id]
    data.value.shared.habits = data.value.shared.habits.filter((habit) => habit.ownerId !== id)
    if (data.value.activeProfileId === id) data.value.activeProfileId = Object.keys(data.value.profiles)[0]
  }

  function updateGoals(goals: HealthGoals): void {
    current.value.goals = { ...goals }
  }

  function updateSettings(settings: ProfileSettings): void {
    current.value.settings = { ...settings }
  }

  // ---------- nutrition ----------
  function addMeal(title: string, meal: MealType, tags: FoodTag[], calories: number | null = null): void {
    current.value.nutritionLogs.unshift({ id: newId(), date: todayKey.value, meal, title: title.trim(), tags, calories })
  }

  function removeMeal(id: string): void {
    current.value.nutritionLogs = current.value.nutritionLogs.filter((log) => log.id !== id)
  }

  function addDrink(kind: 'water' | 'sweet', delta: number): void {
    var entry = drinkEntry()
    entry[kind] = Math.max(0, entry[kind] + delta)
  }

  // ---------- activity ----------
  function addActivity(kind: ActivityKind, minutes: number, note = ''): void {
    if (!Number.isFinite(minutes) || minutes <= 0) throw new Error('مدت فعالیت باید بیشتر از صفر باشد')
    current.value.activityLogs.unshift({ id: newId(), date: todayKey.value, kind, minutes: Math.round(minutes), note: note.trim() })
  }

  function removeActivity(id: string): void {
    current.value.activityLogs = current.value.activityLogs.filter((log) => log.id !== id)
  }

  // ---------- medical ----------
  function addMeasurement(type: MeasurementType, value: number, secondary: number | null, label = '', unit = ''): void {
    if (!Number.isFinite(value) || value <= 0) throw new Error('مقدار نامعتبر است')
    current.value.measurements.unshift({
      id: newId(), date: todayKey.value, type, value, secondary, label: label.trim(), unit: unit.trim() || MEASUREMENT_UNITS[type],
    })
  }

  function removeMeasurement(id: string): void {
    current.value.measurements = current.value.measurements.filter((item) => item.id !== id)
  }

  function addMedication(name: string, dose: string, kind: 'drug' | 'vitamin', time: string): void {
    if (!name.trim()) throw new Error('نام دارو را وارد کنید')
    current.value.medications.push({ id: newId(), name: name.trim(), dose: dose.trim(), kind, time, takenDates: [] })
  }

  function toggleMedicationTaken(id: string): void {
    var item = current.value.medications.find((medication) => medication.id === id)
    if (!item) return
    item.takenDates = item.takenDates.includes(todayKey.value)
      ? item.takenDates.filter((date) => date !== todayKey.value)
      : [...item.takenDates, todayKey.value]
  }

  function removeMedication(id: string): void {
    current.value.medications = current.value.medications.filter((item) => item.id !== id)
  }

  function addAppointment(title: string, kind: AppointmentKind, date: string, time: string, note = ''): void {
    if (!title.trim() || !DateOnly.tryParse(date)) throw new Error('عنوان و تاریخ نوبت را وارد کنید')
    current.value.appointments.push({ id: newId(), title: title.trim(), kind, date, time, note: note.trim() })
    current.value.appointments.sort((a, b) => a.date.localeCompare(b.date))
  }

  function removeAppointment(id: string): void {
    current.value.appointments = current.value.appointments.filter((item) => item.id !== id)
  }

  function addVaccine(name: string, lastDate: string, nextDate: string): void {
    if (!name.trim()) throw new Error('نام واکسن را وارد کنید')
    current.value.vaccines.push({ id: newId(), name: name.trim(), lastDate, nextDate })
  }

  function removeVaccine(id: string): void {
    current.value.vaccines = current.value.vaccines.filter((item) => item.id !== id)
  }

  function markCheckupDone(id: CheckupId, date = todayKey.value): void {
    current.value.checkups[id].lastDate = date
  }

  function setCheckupInterval(id: CheckupId, months: number): void {
    current.value.checkups[id].intervalMonths = Math.max(1, Math.round(months))
  }

  function updateHealthFile(file: Omit<HealthFile, 'doctors'>): void {
    Object.assign(current.value.healthFile, file)
  }

  function addDoctor(name: string, specialty: string, phone: string): void {
    if (!name.trim()) throw new Error('نام پزشک را وارد کنید')
    current.value.healthFile.doctors.push({ id: newId(), name: name.trim(), specialty: specialty.trim(), phone: phone.trim() })
  }

  function removeDoctor(id: string): void {
    current.value.healthFile.doctors = current.value.healthFile.doctors.filter((item) => item.id !== id)
  }

  // ---------- habits and check-in ----------
  function addHabit(title: string, scope: HabitScope, reminderTime: string | null): void {
    if (!title.trim()) throw new Error('عنوان عادت را وارد کنید')
    shared.value.habits.push({
      id: newId(), title: title.trim(), scope, reminderTime: reminderTime || null,
      ownerId: scope === 'personal' ? current.value.profile.id : null, completions: {},
    })
  }

  function toggleHabit(id: string): void {
    var habit = shared.value.habits.find((item) => item.id === id)
    if (!habit) return
    var profileId = current.value.profile.id
    var dates = habit.completions[profileId] ?? []
    habit.completions[profileId] = dates.includes(todayKey.value)
      ? dates.filter((date) => date !== todayKey.value)
      : [...dates, todayKey.value]
  }

  function removeHabit(id: string): void {
    shared.value.habits = shared.value.habits.filter((item) => item.id !== id)
  }

  function saveCheckIn(checkIn: DailyCheckIn): void {
    var list = current.value.checkIns
    var index = list.findIndex((item) => item.date === checkIn.date)
    if (index >= 0) list[index] = { ...checkIn }
    else list.unshift({ ...checkIn })
  }

  // ---------- shared ----------
  function setMeal(day: number, meal: MealType, text: string): void {
    var key = String(day)
    shared.value.mealPlan[key] = { ...shared.value.mealPlan[key], [meal]: text.trim() }
  }

  function addShopping(text: string): void {
    if (text.trim()) shared.value.shopping.push({ id: newId(), text: text.trim(), done: false })
  }

  function toggleShopping(item: SharedShoppingItem): void {
    item.done = !item.done
  }

  function removeShopping(id: string): void {
    shared.value.shopping = shared.value.shopping.filter((item) => item.id !== id)
  }

  function addChallenge(title: string, kind: ChallengeKind, startDate: string, endDate: string, targetMinutes: number): void {
    var start = DateOnly.tryParse(startDate)
    var end = DateOnly.tryParse(endDate)
    if (!title.trim() || !start || !end || end.value < start.value) throw new Error('عنوان و بازهٔ تاریخ چالش را درست وارد کنید')
    var challenge: Challenge = { id: newId(), title: title.trim(), kind, startDate, endDate, targetMinutes, completions: {} }
    shared.value.challenges.unshift(challenge)
  }

  function toggleChallengeToday(id: string): void {
    var challenge = shared.value.challenges.find((item) => item.id === id)
    if (!challenge) return
    var profileId = current.value.profile.id
    var dates = challenge.completions[profileId] ?? []
    challenge.completions[profileId] = dates.includes(todayKey.value)
      ? dates.filter((date) => date !== todayKey.value)
      : [...dates, todayKey.value]
  }

  function removeChallenge(id: string): void {
    shared.value.challenges = shared.value.challenges.filter((item) => item.id !== id)
  }

  function setSleepGoal(start: string, end: string): void {
    shared.value.sleepGoal = { start, end }
  }

  // ---------- data ----------
  function replaceAll(next: AppData): void {
    data.value = normalizeAppData(next)
    flush()
  }

  function resetAll(): void {
    data.value = createDefaultAppData()
    flush()
  }

  return {
    data, todayKey, current, profiles, shared, weekStart, weekNutrition, weekActivity, todayDrinks, tagCounts,
    weekSweetDrinks, todayCalories, activitySummary, checkupViews, visibleHabits, challengeFacts,
    refreshToday, addProfile, setActiveProfile, updateProfile, removeProfile, updateGoals, updateSettings,
    addMeal, removeMeal, addDrink, addActivity, removeActivity, addMeasurement, removeMeasurement,
    addMedication, toggleMedicationTaken, removeMedication, addAppointment, removeAppointment,
    addVaccine, removeVaccine, markCheckupDone, setCheckupInterval, updateHealthFile, addDoctor, removeDoctor,
    addHabit, toggleHabit, removeHabit, saveCheckIn, setMeal, addShopping, toggleShopping, removeShopping,
    addChallenge, toggleChallengeToday, removeChallenge, setSleepGoal, replaceAll, resetAll, flush,
  }
})
