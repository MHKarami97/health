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

export var mergeAppData = (current: AppData, incoming: AppData): AppData => {
  var base = normalizeAppData(current)
  var inc = normalizeAppData(incoming)

  var mergedProfiles: Record<string, ProfileData> = { ...base.profiles }

  var mergeById = <T extends { id: string }>(curList: T[], incList: T[]): T[] => {
    var map = new Map<string, T>()
    curList.forEach((item) => map.set(item.id, item))
    incList.forEach((item) => map.set(item.id, item))
    return Array.from(map.values())
  }

  Object.entries(inc.profiles).forEach(([id, incProfileData]) => {
    if (!mergedProfiles[id]) {
      mergedProfiles[id] = incProfileData
      return
    }

    var cur = mergedProfiles[id]

    var drinkMap = new Map<string, { date: string; water: number; sweet: number }>()
    cur.drinkLogs.forEach((item) => drinkMap.set(item.date, { ...item }))
    incProfileData.drinkLogs.forEach((item) => {
      var existing = drinkMap.get(item.date)
      if (existing) {
        drinkMap.set(item.date, {
          date: item.date,
          water: Math.max(existing.water, item.water),
          sweet: Math.max(existing.sweet, item.sweet),
        })
      } else {
        drinkMap.set(item.date, { ...item })
      }
    })

    var mergedCheckups = { ...cur.checkups }
    Object.entries(incProfileData.checkups).forEach(([checkupKey, checkupRec]) => {
      var k = checkupKey as CheckupId
      if (!mergedCheckups[k]) {
        mergedCheckups[k] = checkupRec
      } else if (checkupRec.lastDate) {
        if (!mergedCheckups[k].lastDate || checkupRec.lastDate > (mergedCheckups[k].lastDate || '')) {
          mergedCheckups[k] = checkupRec
        }
      }
    })

    var checkInMap = new Map<string, DailyCheckIn>()
    cur.checkIns.forEach((item) => checkInMap.set(item.date, { ...item }))
    incProfileData.checkIns.forEach((item) => {
      var existing = checkInMap.get(item.date)
      if (existing) {
        checkInMap.set(item.date, { ...existing, ...item })
      } else {
        checkInMap.set(item.date, { ...item })
      }
    })

    mergedProfiles[id] = {
      profile: { ...cur.profile, ...incProfileData.profile },
      settings: { ...cur.settings, ...incProfileData.settings },
      goals: { ...cur.goals, ...incProfileData.goals },
      healthFile: {
        ...cur.healthFile,
        ...incProfileData.healthFile,
        doctors: mergeById(cur.healthFile.doctors || [], incProfileData.healthFile.doctors || []),
      },
      nutritionLogs: mergeById(cur.nutritionLogs, incProfileData.nutritionLogs),
      drinkLogs: Array.from(drinkMap.values()),
      activityLogs: mergeById(cur.activityLogs, incProfileData.activityLogs),
      measurements: mergeById(cur.measurements, incProfileData.measurements),
      medications: mergeById(cur.medications, incProfileData.medications),
      appointments: mergeById(cur.appointments, incProfileData.appointments),
      vaccines: mergeById(cur.vaccines, incProfileData.vaccines),
      checkups: mergedCheckups,
      checkIns: Array.from(checkInMap.values()),
    }
  })

  var mergedShared = {
    ...base.shared,
    ...inc.shared,
    mealPlan: { ...base.shared.mealPlan, ...inc.shared.mealPlan },
    shopping: mergeById(base.shared.shopping || [], inc.shared.shopping || []),
    challenges: mergeById(base.shared.challenges || [], inc.shared.challenges || []),
    habits: mergeById(base.shared.habits || [], inc.shared.habits || []),
    sleepGoal: inc.shared.sleepGoal || base.shared.sleepGoal,
  }

  return {
    version: 1,
    activeProfileId: base.activeProfileId,
    profiles: mergedProfiles,
    shared: mergedShared,
  }
}

