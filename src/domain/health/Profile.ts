export type Sex = 'male' | 'female' | 'unspecified'

export interface Profile {
  id: string
  name: string
  sex: Sex
  birthYear: number | null
}

export interface Doctor {
  id: string
  name: string
  specialty: string
  phone: string
}

export interface HealthFile {
  bloodType: string
  allergies: string
  conditions: string
  doctors: Doctor[]
}

export interface ProfileSettings {
  trackBody: boolean
  trackCalories: boolean
  energyTarget: number
  moveReminderMinutes: number
  remindersEnabled: boolean
}

export var DEFAULT_SETTINGS: ProfileSettings = {
  trackBody: false,
  trackCalories: false,
  energyTarget: 2000,
  moveReminderMinutes: 0,
  remindersEnabled: false,
}

export var DEFAULT_HEALTH_FILE: HealthFile = { bloodType: '', allergies: '', conditions: '', doctors: [] }
