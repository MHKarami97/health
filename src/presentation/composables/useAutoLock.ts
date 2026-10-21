import { onBeforeUnmount, onMounted, watch } from 'vue'
import { useLockStore } from '@application/stores/lockStore'

var ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'touchstart'] as const

export function useAutoLock(): void {
  var lockStore = useLockStore()
  var timer: ReturnType<typeof setTimeout> | null = null

  function clear(): void {
    if (timer) clearTimeout(timer)
    timer = null
  }

  function arm(): void {
    clear()
    if (!lockStore.isEnabled || lockStore.isLocked || lockStore.autoLockMinutes <= 0) return
    timer = setTimeout(() => lockStore.lock(), lockStore.autoLockMinutes * 60_000)
  }

  function onVisibility(): void {
    if (document.visibilityState === 'hidden') arm()
  }

  onMounted(() => {
    ACTIVITY_EVENTS.forEach((name) => window.addEventListener(name, arm, { passive: true }))
    document.addEventListener('visibilitychange', onVisibility)
    arm()
  })

  onBeforeUnmount(() => {
    clear()
    ACTIVITY_EVENTS.forEach((name) => window.removeEventListener(name, arm))
    document.removeEventListener('visibilitychange', onVisibility)
  })

  watch(() => [lockStore.isEnabled, lockStore.isLocked, lockStore.autoLockMinutes], arm)
}
