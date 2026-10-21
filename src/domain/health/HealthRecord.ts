export type MeasurementType = 'blood-pressure' | 'weight' | 'blood-sugar' | 'waist'

export interface Measurement {
  id: string
  date: string
  type: MeasurementType
  value: number
  secondaryValue?: number
  unit: string
}

export interface Medication {
  id: string
  name: string
  time: string
  takenToday: boolean
}

export interface Appointment {
  id: string
  title: string
  date: string
  note: string
}

export interface Vaccine {
  id: string
  name: string
  nextDate: string
}

export const MEASUREMENT_LABELS_FA: Record<MeasurementType, string> = {
  'blood-pressure': 'فشار خون',
  weight: 'وزن',
  'blood-sugar': 'قند خون',
  waist: 'دور کمر',
}
