<script setup lang="ts">
import { reactive } from 'vue'
import { useAppStore } from '@application/stores/appStore'
import { APPOINTMENT_LABELS, type AppointmentKind } from '@domain/health/Medical'
import { persianDate } from '@domain/valueObjects/DateOnly'
import PageCard from '@presentation/components/shared/PageCard.vue'
import PersianDatePicker from '@presentation/components/shared/PersianDatePicker.vue'
import { useAction } from '@presentation/composables/useAction'

var store = useAppStore()
var action = useAction()
var kinds = Object.keys(APPOINTMENT_LABELS) as AppointmentKind[]
var appointment = reactive({ title: '', kind: 'doctor' as AppointmentKind, date: '', time: '09:00' })
var vaccine = reactive({ name: '', lastDate: '', nextDate: '' })

async function addAppointment(): Promise<void> {
  var ok = await action.run(() => store.addAppointment(appointment.title, appointment.kind, appointment.date, appointment.time), 'نوبت ثبت شد')
  if (ok) Object.assign(appointment, { title: '', date: '' })
}

async function addVaccine(): Promise<void> {
  var ok = await action.run(() => store.addVaccine(vaccine.name, vaccine.lastDate, vaccine.nextDate), 'واکسن ثبت شد')
  if (ok) Object.assign(vaccine, { name: '', lastDate: '', nextDate: '' })
}
</script>

<template>
  <PageCard title="نوبت پزشک و دندان‌پزشک">
    <ul class="flex flex-col gap-2">
      <li v-for="item in store.current.appointments" :key="item.id" class="flex items-center justify-between gap-2 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800/60">
        <span>📅 {{ item.title }} <span class="muted">{{ APPOINTMENT_LABELS[item.kind] }} · {{ persianDate(item.date) }} · {{ item.time }}</span></span>
        <button type="button" class="text-xs text-rose-500" @click="store.removeAppointment(item.id)">حذف</button>
      </li>
    </ul>
    <form class="grid gap-2 sm:grid-cols-4" @submit.prevent="addAppointment">
      <input v-model="appointment.title" placeholder="عنوان" class="sm:col-span-2" />
      <select v-model="appointment.kind" aria-label="نوع نوبت"><option v-for="kind in kinds" :key="kind" :value="kind">{{ APPOINTMENT_LABELS[kind] }}</option></select>
      <PersianDatePicker v-model="appointment.date" label="تاریخ نوبت" :clearable="false" />
      <input v-model="appointment.time" type="time" aria-label="ساعت" />
      <button type="submit" class="btn-primary sm:col-span-3">افزودن نوبت</button>
    </form>
    <p class="muted">یادآور: یک روز قبل ساعت ۹ صبح و در ساعت نوبت.</p>
  </PageCard>

  <PageCard title="واکسن‌ها">
    <ul class="flex flex-col gap-2">
      <li v-for="item in store.current.vaccines" :key="item.id" class="flex items-center justify-between gap-2 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800/60">
        <span>💉 {{ item.name }} <span class="muted">آخرین: {{ item.lastDate ? persianDate(item.lastDate) : '—' }} · بعدی: {{ item.nextDate ? persianDate(item.nextDate) : '—' }}</span></span>
        <button type="button" class="text-xs text-rose-500" @click="store.removeVaccine(item.id)">حذف</button>
      </li>
    </ul>
    <form class="grid gap-2 sm:grid-cols-3" @submit.prevent="addVaccine">
      <input v-model="vaccine.name" placeholder="نام واکسن" class="sm:col-span-3" />
      <div class="field">تاریخ آخرین دوز<PersianDatePicker v-model="vaccine.lastDate" label="تاریخ آخرین دوز" /></div>
      <div class="field">تاریخ نوبت بعدی<PersianDatePicker v-model="vaccine.nextDate" label="تاریخ نوبت بعدی" /></div>
      <button type="submit" class="btn-primary self-end">افزودن</button>
    </form>
  </PageCard>
</template>
