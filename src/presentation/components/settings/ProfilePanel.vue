<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '@application/stores/appStore'
import type { Sex } from '@domain/health/Profile'
import PageCard from '@presentation/components/shared/PageCard.vue'
import { useAction } from '@presentation/composables/useAction'

var store = useAppStore()
var action = useAction()
var newName = ref('')

function removeCurrent(): void {
  if (!confirm(`پروفایل «${store.current.profile.name}» و همهٔ داده‌هایش حذف شود؟`)) return
  void action.run(() => store.removeProfile(store.current.profile.id), 'پروفایل حذف شد')
}

function addProfile(): void {
  store.addProfile(newName.value)
  newName.value = ''
}
</script>

<template>
  <PageCard title="پروفایل">
    <label class="field">نام<input :value="store.current.profile.name" maxlength="30" @change="store.updateProfile({ name: ($event.target as HTMLInputElement).value.trim() || store.current.profile.name })" /></label>
    <div class="grid grid-cols-2 gap-3">
      <label class="field">جنسیت (برای تقویم چکاپ)
        <select :value="store.current.profile.sex" @change="store.updateProfile({ sex: ($event.target as HTMLSelectElement).value as Sex })">
          <option value="unspecified">نامشخص</option><option value="male">مرد</option><option value="female">زن</option>
        </select>
      </label>
      <label class="field">سال تولد (میلادی)
        <input type="number" min="1900" max="2100" inputmode="numeric" :value="store.current.profile.birthYear ?? ''" @change="store.updateProfile({ birthYear: Number(($event.target as HTMLInputElement).value) || null })" />
      </label>
    </div>
    <form class="flex gap-2" @submit.prevent="addProfile">
      <input v-model="newName" placeholder="نام پروفایل جدید (مثلاً همسر)" maxlength="30" />
      <button type="submit" class="btn-soft shrink-0">افزودن</button>
    </form>
    <button v-if="store.profiles.length > 1" type="button" class="btn-danger" @click="removeCurrent">حذف این پروفایل</button>
  </PageCard>
</template>
