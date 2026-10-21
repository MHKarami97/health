<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useAppStore } from '@application/stores/appStore'
import PageCard from '@presentation/components/shared/PageCard.vue'
import { useAction } from '@presentation/composables/useAction'

var store = useAppStore()
var action = useAction()
var BLOOD_TYPES = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

var form = reactive({ ...store.current.healthFile })
var doctor = reactive({ name: '', specialty: '', phone: '' })

watch(() => store.current.profile.id, () => Object.assign(form, store.current.healthFile))

function save(): void {
  void action.run(() => store.updateHealthFile({ bloodType: form.bloodType, allergies: form.allergies, conditions: form.conditions }), 'پروندهٔ سلامت ذخیره شد')
}

async function addDoctor(): Promise<void> {
  var ok = await action.run(() => store.addDoctor(doctor.name, doctor.specialty, doctor.phone), 'پزشک اضافه شد')
  if (ok) Object.assign(doctor, { name: '', specialty: '', phone: '' })
}
</script>

<template>
  <PageCard :title="`پروندهٔ سلامت ${store.current.profile.name}`">
    <label class="field">گروه خونی
      <select v-model="form.bloodType"><option v-for="type in BLOOD_TYPES" :key="type" :value="type">{{ type || 'نامشخص' }}</option></select>
    </label>
    <label class="field">آلرژی‌ها<textarea v-model="form.allergies" rows="2" /></label>
    <label class="field">بیماری‌ها و شرایط خاص<textarea v-model="form.conditions" rows="2" /></label>
    <button type="button" class="btn-primary" @click="save">ذخیره</button>
  </PageCard>

  <PageCard title="پزشک‌ها">
    <ul class="flex flex-col gap-2">
      <li v-for="item in store.current.healthFile.doctors" :key="item.id" class="flex items-center justify-between gap-2 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800/60">
        <span>{{ item.name }} <span class="muted">{{ item.specialty }}</span> <a v-if="item.phone" :href="`tel:${item.phone}`" class="text-teal-700 dark:text-teal-300" dir="ltr">{{ item.phone }}</a></span>
        <button type="button" class="text-xs text-rose-500" @click="store.removeDoctor(item.id)">حذف</button>
      </li>
    </ul>
    <form class="grid gap-2 sm:grid-cols-3" @submit.prevent="addDoctor">
      <input v-model="doctor.name" placeholder="نام پزشک" />
      <input v-model="doctor.specialty" placeholder="تخصص" />
      <input v-model="doctor.phone" placeholder="تلفن" inputmode="tel" dir="ltr" />
      <button type="submit" class="btn-soft sm:col-span-3">افزودن پزشک</button>
    </form>
  </PageCard>
</template>
