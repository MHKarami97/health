<script setup lang="ts">
import { ref } from 'vue'
import { useLockStore } from '@application/stores/lockStore'

var lockStore = useLockStore()
var password = ref('')
var error = ref('')
var isBusy = ref(false)

async function submit(): Promise<void> {
  isBusy.value = true
  error.value = ''
  var ok = await lockStore.unlock(password.value)
  if (!ok) error.value = 'رمز عبور درست نیست'
  password.value = ''
  isBusy.value = false
}
</script>

<template>
  <div class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-100 p-6 dark:bg-slate-950">
    <form class="flex w-full max-w-sm flex-col gap-4 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800" @submit.prevent="submit">
      <h1 class="text-center text-xl font-bold text-teal-700 dark:text-teal-300">سلامت</h1>
      <label class="field">
        رمز عبور
        <input v-model="password" type="password" autocomplete="current-password" autofocus dir="ltr" />
      </label>
      <p v-if="error" class="text-xs text-rose-500" role="alert">{{ error }}</p>
      <button type="submit" class="btn-primary" :disabled="isBusy || !password">ورود</button>
    </form>
  </div>
</template>
