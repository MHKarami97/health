<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useLockStore } from '@application/stores/lockStore'
import { useAppStore } from '@application/stores/appStore'
import { useToastStore } from '@application/stores/toastStore'
import { useThemeStore } from '@application/stores/themeStore'
import { ReminderService } from '@application/services/ReminderService'
import LockScreen from '@presentation/components/lock/LockScreen.vue'
import ToastHost from '@presentation/components/shared/ToastHost.vue'
import { useAutoLock } from '@presentation/composables/useAutoLock'

var lockStore = useLockStore()
useThemeStore()
var reminders = new ReminderService(useAppStore(), useToastStore())

useAutoLock()

onMounted(() => {
  reminders.start()
})

onBeforeUnmount(() => {
  reminders.stop()
})
</script>

<template>
  <LockScreen v-if="lockStore.isLocked" />
  <RouterView v-else />
  <ToastHost />
</template>