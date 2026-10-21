<script setup lang="ts">
import { ref } from 'vue'
import { useHealthStore } from '@application/stores/healthStore'
import { MEASUREMENT_LABELS_FA, type MeasurementType } from '@domain/health/HealthRecord'
import PageCard from '@presentation/components/shared/PageCard.vue'

var store = useHealthStore()
var measurementType = ref<MeasurementType>('blood-pressure')
var value = ref(0)
var secondaryValue = ref<number | undefined>()
var medicationName = ref('')
var medicationTime = ref('08:00')
var appointmentTitle = ref('')
var appointmentDate = ref('')

var types = Object.keys(MEASUREMENT_LABELS_FA) as MeasurementType[]

function saveMeasurement(): void {
  store.addMeasurement(measurementType.value, value.value, secondaryValue.value)
  value.value = 0
  secondaryValue.value = undefined
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <PageCard title="ثبت اندازه‌گیری">
      <select v-model="measurementType" class="mb-3 w-full rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
        <option v-for="item in types" :key="item" :value="item">{{ MEASUREMENT_LABELS_FA[item] }}</option>
      </select>
      <input v-model.number="value" type="number" class="mb-3 w-full rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800" placeholder="مقدار" />
      <input v-if="measurementType === 'blood-pressure'" v-model.number="secondaryValue" type="number" class="mb-3 w-full rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800" placeholder="فشار دیاستولیک" />
      <button type="button" class="w-full rounded-xl bg-teal-500 py-2.5 text-sm font-medium text-white" @click="saveMeasurement">ثبت</button>
    </PageCard>

    <PageCard title="دارو و ویتامین">
      <div class="mb-3 flex gap-2">
        <input v-model="medicationName" placeholder="نام دارو" class="flex-1 rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800" />
        <input v-model="medicationTime" type="time" class="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800" />
      </div>
      <button type="button" class="mb-3 w-full rounded-xl bg-slate-800 py-2 text-sm text-white dark:bg-slate-700" @click="store.addMedication(medicationName, medicationTime); medicationName = ''">
        افزودن
      </button>
      <ul class="space-y-2">
        <li v-for="medication in store.medications" :key="medication.id" class="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
          <span>{{ medication.name }} - {{ medication.time }}</span>
          <button type="button" class="rounded-lg px-3 py-1 text-xs" :class="medication.takenToday ? 'bg-teal-500 text-white' : 'bg-slate-200 dark:bg-slate-700'" @click="store.toggleMedication(medication.id)">
            {{ medication.takenToday ? 'مصرف شد' : 'ثبت مصرف' }}
          </button>
        </li>
      </ul>
    </PageCard>

    <PageCard title="نوبت‌ها">
      <div class="mb-3 flex gap-2">
        <input v-model="appointmentTitle" placeholder="مثلاً دندان‌پزشکی" class="flex-1 rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800" />
        <input v-model="appointmentDate" type="date" class="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800" />
      </div>
      <button type="button" class="mb-3 w-full rounded-xl bg-slate-800 py-2 text-sm text-white dark:bg-slate-700" @click="store.addAppointment(appointmentTitle, appointmentDate); appointmentTitle = ''">
        افزودن نوبت
      </button>
      <ul class="space-y-2 text-sm">
        <li v-for="appointment in store.appointments" :key="appointment.id" class="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
          {{ appointment.title }} - {{ appointment.date }}
        </li>
      </ul>
    </PageCard>
  </div>
</template>
