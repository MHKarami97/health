export type MeasurementType = 'blood-pressure' | 'weight' | 'waist' | 'blood-sugar' | 'cholesterol' | 'other'

export interface Measurement {
  id: string
  date: string
  type: MeasurementType
  value: number
  secondary: number | null
  label: string
  unit: string
}

export var MEASUREMENT_LABELS: Record<MeasurementType, string> = {
  'blood-pressure': 'فشار خون',
  weight: 'وزن',
  waist: 'دور کمر',
  'blood-sugar': 'قند خون',
  cholesterol: 'کلسترول',
  other: 'آزمایش دیگر',
}

export var MEASUREMENT_UNITS: Record<MeasurementType, string> = {
  'blood-pressure': 'mmHg',
  weight: 'kg',
  waist: 'cm',
  'blood-sugar': 'mg/dL',
  cholesterol: 'mg/dL',
  other: '',
}

export var BODY_TYPES: MeasurementType[] = ['weight', 'waist']

export interface Medication {
  id: string
  name: string
  dose: string
  kind: 'drug' | 'vitamin'
  time: string
  takenDates: string[]
}

export type AppointmentKind = 'doctor' | 'dentist' | 'lab' | 'other'

export interface Appointment {
  id: string
  title: string
  kind: AppointmentKind
  date: string
  time: string
  note: string
}

export var APPOINTMENT_LABELS: Record<AppointmentKind, string> = {
  doctor: 'پزشک',
  dentist: 'دندان‌پزشک',
  lab: 'آزمایشگاه',
  other: 'سایر',
}

export interface Vaccine {
  id: string
  name: string
  lastDate: string
  nextDate: string
}
