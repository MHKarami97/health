<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useLockStore } from '@application/stores/lockStore'
import { useAppStore } from '@application/stores/appStore'
import { useToastStore } from '@application/stores/toastStore'
import { ReminderService } from '@application/services/ReminderService'
import LockScreen from '@presentation/components/lock/LockScreen.vue'
import ToastHost from '@presentation/components/shared/ToastHost.vue'
import { useAutoLock } from '@presentation/composables/useAutoLock'

var lockStore = useLockStore()
var reminders = new ReminderService(useAppStore(), useToastStore())
var darkQuery = window.matchMedia('(prefers-color-scheme: dark)')

function applyTheme(): void {
  document.documentElement.classList.toggle('dark', darkQuery.matches)
}

useAutoLock()

onMounted(() => {
  applyTheme()
  darkQuery.addEventListener('change', applyTheme)
  reminders.start()
})

onBeforeUnmount(() => {
  darkQuery.removeEventListener('change', applyTheme)
  reminders.stop()
})
</script>

<template>
  <LockScreen v-if="lockStore.isLocked" />
  <RouterView v-else />
  <ToastHost />
</template>
