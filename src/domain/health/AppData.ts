import { DEFAULT_GOALS, type HealthGoals } from './Goals'
import { DEFAULT_HEALTH_FILE, DEFAULT_SETTINGS, type HealthFile, type Profile, type ProfileSettings } from './Profile'
import type { NutritionLog, DrinkLog, MealType } from './NutritionLog'
import type { ActivityLog } from './ActivityLog'
import type { Appointment, Measurement, Medication, Vaccine } from './Medical'
import type { DailyCheckIn, Habit } from './Habit'
import type { Challenge } from './Challenge'
import { defaultCheckupRecords, type CheckupId, type CheckupRecord } from './Checkups'

export interface ProfileData {
  profile: Profile
  settings: ProfileSettings
  goals: HealthGoals
  healthFile: HealthFile
  nutritionLogs: NutritionLog[]
  drinkLogs: DrinkLog[]
  activityLogs: ActivityLog[]
  measurements: Measurement[]
  medications: Medication[]
  appointments: Appointment[]
  vaccines: Vaccine[]
  checkups: Record<CheckupId, CheckupRecord>
  checkIns: DailyCheckIn[]
}

export interface SharedShoppingItem {
  id: string
  text: string
  done: boolean
}

export interface SharedData {
  mealPlan: Record<string, Partial<Record<MealType, string>>>
  shopping: SharedShoppingItem[]
  challenges: Challenge[]
  sleepGoal: { start: string; end: string }
  habits: Habit[]
}

export interface AppData {
  version: 1
  activeProfileId: string
  profiles: Record<string, ProfileData>
  shared: SharedData
}

export var createProfileData = (id: string, name: string): ProfileData => ({
  profile: { id, name, sex: 'unspecified', birthYear: null },
  settings: { ...DEFAULT_SETTINGS },
  goals: { ...DEFAULT_GOALS },
  healthFile: { ...DEFAULT_HEALTH_FILE, doctors: [] },
  nutritionLogs: [],
  drinkLogs: [],
  activityLogs: [],
  measurements: [],
  medications: [],
  appointments: [],
  vaccines: [],
  checkups: defaultCheckupRecords(),
  checkIns: [],
})

export var createEmptyShared = (): SharedData => ({
  mealPlan: {},
  shopping: [],
  challenges: [],
  sleepGoal: { start: '23:00', end: '07:00' },
  habits: [],
})

export var createDefaultAppData = (): AppData => {
  var id = 'me'
  return {
    version: 1,
    activeProfileId: id,
    profiles: { [id]: createProfileData(id, 'من') },
    shared: createEmptyShared(),
  }
}

/** Fills gaps so older or hand-edited backups still load safely. */
export var normalizeAppData = (raw: Partial<AppData> | null | undefined): AppData => {
  var base = createDefaultAppData()
  if (!raw || typeof raw !== 'object' || !raw.profiles || Object.keys(raw.profiles).length === 0) return base

  var profiles: Record<string, ProfileData> = {}
  Object.entries(raw.profiles).forEach(([id, data]) => {
    var fresh = createProfileData(id, data?.profile?.name ?? 'پروفایل')
    profiles[id] = {
      ...fresh,
      ...data,
      profile: { ...fresh.profile, ...data?.profile, id },
      settings: { ...fresh.settings, ...data?.settings },
      goals: { ...fresh.goals, ...data?.goals },
      healthFile: { ...fresh.healthFile, ...data?.healthFile },
      checkups: { ...fresh.checkups, ...data?.checkups },
    }
  })

  var activeId = raw.activeProfileId && profiles[raw.activeProfileId] ? raw.activeProfileId : Object.keys(profiles)[0]
  return { version: 1, activeProfileId: activeId, profiles, shared: { ...createEmptyShared(), ...raw.shared } }
}
