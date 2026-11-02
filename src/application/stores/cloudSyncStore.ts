import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CloudRestoreMode, CloudSyncSnapshot } from '@domain/health/CloudSync'
import { cloudSyncService } from '@infrastructure/cloud'
import { formatDateTimeFa } from '@infrastructure/cloud/cloudFormat'

export var useCloudSyncStore = defineStore('cloudSync', () => {
  var isOnline = ref(typeof navigator !== 'undefined' ? navigator.onLine : true)
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      isOnline.value = true
    })
    window.addEventListener('offline', () => {
      isOnline.value = false
    })
  }

  var snapshot = ref<CloudSyncSnapshot>(cloudSyncService.getSnapshot())
  cloudSyncService.subscribe((next) => {
    snapshot.value = next
  })

  var isConnected = computed(() => snapshot.value.connected)
  var isBusy = computed(() => snapshot.value.status === 'syncing')
  var lastSuccessText = computed(() => formatDateTimeFa(snapshot.value.lastSuccessAt))

  var statusText = computed(() => {
    switch (snapshot.value.status) {
      case 'disconnected':
        return 'متصل نیست'
      case 'syncing':
        return 'در حال همگام‌سازی...'
      case 'needs-reconnect':
        return 'اتصال به Google نیاز به تأیید دوباره دارد'
      case 'error':
        return snapshot.value.lastError || 'همگام‌سازی ناموفق بود'
      case 'decision-pending':
        return 'نسخه‌ی ابری منتظر تصمیم شماست'
      case 'success':
        return 'همگام و به‌روز است'
      default:
        return snapshot.value.lastSuccessAt
          ? 'همگام و به‌روز است'
          : 'متصل است؛ هنوز پشتیبانی گرفته نشده'
    }
  })

  var showFailureBar = computed(() => {
    var status = snapshot.value.status
    return (
      snapshot.value.connected &&
      snapshot.value.notifyFailures &&
      (status === 'error' || status === 'needs-reconnect') &&
      isOnline.value
    )
  })

  var failureBarMessage = computed(() =>
    snapshot.value.status === 'needs-reconnect'
      ? 'دیتا همگام‌سازی نشد؛ اتصال به Google Drive نیاز به تأیید دوباره دارد.'
      : `دیتا همگام‌سازی نشد. ${snapshot.value.lastError || ''}`.trim(),
  )

  return {
    snapshot,
    isConnected,
    isBusy,
    isOnline,
    statusText,
    lastSuccessText,
    showFailureBar,
    failureBarMessage,
    start: () => cloudSyncService.start(),
    preload: () => cloudSyncService.preload(),
    connect: () => cloudSyncService.connect(),
    disconnect: (deleteRemote: boolean) => cloudSyncService.disconnect(deleteRemote),
    backupNow: () => cloudSyncService.backupNow('manual'),
    resolveRestore: (mode: CloudRestoreMode, passphrase?: string) =>
      cloudSyncService.resolveRestore(mode, passphrase),
    resolveKeepLocal: () => cloudSyncService.resolveKeepLocal(),
    dismissDecision: () => cloudSyncService.dismissDecision(),
    reopenDecision: () => cloudSyncService.reopenDecision(),
    rollbackLastRestore: () => cloudSyncService.rollbackLastRestore(),
    enableEncryption: (passphrase: string) => cloudSyncService.enableEncryption(passphrase),
    disableEncryption: () => cloudSyncService.disableEncryption(),
    setNotifyFailures: (value: boolean) => cloudSyncService.setNotifyFailures(value),
  }
})
