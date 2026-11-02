<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { CLOUD_CONFIG } from '@infrastructure/cloud/cloudConfig'
import { toUserMessage } from '@infrastructure/cloud/CloudSyncError'
import { useCloudSyncStore } from '@application/stores/cloudSyncStore'
import { useToastStore } from '@application/stores/toastStore'
import PageCard from '@presentation/components/shared/PageCard.vue'

var store = useCloudSyncStore()
var toastStore = useToastStore()

var minLength = CLOUD_CONFIG.minPassphraseLength
var snapshot = computed(() => store.snapshot)
var passphrase = ref('')
var passphraseConfirm = ref('')
var isWorking = ref(false)

onMounted(() => {
  store.preload()
})

var pillClass = computed(() => {
  switch (snapshot.value.status) {
    case 'success':
    case 'idle':
      return snapshot.value.connected
        ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-200'
        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
    case 'syncing':
      return 'bg-blue-100 text-blue-800 animate-pulse dark:bg-blue-900/60 dark:text-blue-200'
    case 'needs-reconnect':
    case 'decision-pending':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200'
    case 'error':
      return 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200'
    default:
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
  }
})

async function run(action: () => Promise<void>, successMessage?: string): Promise<void> {
  isWorking.value = true
  try {
    await action()
    if (successMessage) toastStore.show(successMessage)
  } catch (error) {
    toastStore.show(toUserMessage(error))
  } finally {
    isWorking.value = false
  }
}

function handleConnect(): Promise<void> {
  return run(() => store.connect(), 'اتصال به Google Drive با موفقیت برقرار شد.')
}

function handleBackupNow(): Promise<void> {
  return run(() => store.backupNow(), 'پشتیبان‌گیری در Google Drive انجام شد.')
}

async function handleDisconnect(): Promise<void> {
  if (!confirm('اتصال به Google Drive قطع شود؟ پشتیبان‌گیری خودکار متوقف می‌شود.')) return
  var removeRemote = confirm(
    'آیا نسخه‌های پشتیبان موجود در پوشه مخفی Google Drive هم حذف شوند؟\nتأیید = حذف نسخه‌های ابری، لغو = نگه‌داشتن فایل‌ها در Drive',
  )
  await run(() => store.disconnect(removeRemote), 'اتصال با موفقیت قطع شد.')
}

async function handleEnableEncryption(): Promise<void> {
  if (passphrase.value.length < minLength) {
    toastStore.show(`رمز عبور باید حداقل ${minLength} نویسه باشد.`)
    return
  }
  if (passphrase.value !== passphraseConfirm.value) {
    toastStore.show('رمز عبور و تکرار آن یکسان نیستند.')
    return
  }
  await run(async () => {
    await store.enableEncryption(passphrase.value)
    passphrase.value = ''
    passphraseConfirm.value = ''
  }, 'رمزنگاری سمت کلاینت با موفقیت فعال شد.')
}

async function handleDisableEncryption(): Promise<void> {
  if (!confirm('از این پس پشتیبان‌های ابری بدون رمزنگاری ذخیره می‌شوند. آیا ادامه می‌دهید؟')) return
  await run(() => store.disableEncryption(), 'رمزنگاری غیرفعال شد.')
}

async function handleRollback(): Promise<void> {
  if (!confirm('اطلاعات این دستگاه به وضعیت قبل از آخرین بازیابی ابری بازمی‌گردد. آیا ادامه می‌دهید؟')) return
  await run(() => store.rollbackLastRestore(), 'داده‌ها به وضعیت پیش از بازیابی برگشت.')
}
</script>

<template>
  <PageCard title="پشتیبان‌گیری خودکار در Google Drive">
    <template #header>
      <span :class="['rounded-full px-2.5 py-0.5 text-xs font-semibold', pillClass]">
        {{ store.statusText }}
      </span>
    </template>

    <p class="muted">
      نسخه‌ی پشتیبان در پوشه‌ی مخفی اختصاصی همین برنامه در Google Drive شخصی شما (appDataFolder) ذخیره می‌شود
      و سایر برنامه‌ها به آن دسترسی ندارند. پس از هر تغییر دیتا، پشتیبان‌گیری به‌صورت خودکار با چند ثانیه تأخیر انجام می‌شود.
    </p>

    <!-- وضعیت اتصال و جزئیات -->
    <div class="flex flex-col gap-2 rounded-xl bg-slate-50 p-3 text-xs ring-1 ring-slate-200/60 dark:bg-slate-800/50 dark:ring-slate-700/60">
      <div class="flex items-center justify-between">
        <span class="text-slate-500 dark:text-slate-400">وضعیت اتصال:</span>
        <strong class="font-medium text-slate-800 dark:text-slate-200">{{ store.statusText }}</strong>
      </div>
      <div v-if="store.isConnected && store.lastSuccessText" class="flex items-center justify-between">
        <span class="text-slate-500 dark:text-slate-400">آخرین پشتیبان موفق:</span>
        <strong class="font-medium text-slate-800 dark:text-slate-200">{{ store.lastSuccessText }}</strong>
      </div>
      <p v-if="store.isConnected && snapshot.status !== 'error' && snapshot.lastError" class="text-xs text-rose-500">
        {{ snapshot.lastError }}
      </p>
    </div>

    <!-- دکمه‌های عملیات -->
    <div class="flex flex-wrap items-center gap-2">
      <button
        v-if="!store.isConnected"
        type="button"
        :disabled="isWorking"
        class="btn-primary"
        @click="handleConnect"
      >
        🔗 اتصال به Google Drive
      </button>

      <template v-else>
        <button
          v-if="snapshot.status === 'needs-reconnect' || snapshot.status === 'error'"
          type="button"
          :disabled="isWorking"
          class="btn-soft"
          @click="handleConnect"
        >
          🔄 اتصال دوباره
        </button>

        <button
          v-if="snapshot.decision && snapshot.decision.dismissed"
          type="button"
          class="btn-soft"
          @click="store.reopenDecision()"
        >
          ☁️ بررسی نسخه‌ی ابری
        </button>

        <button
          type="button"
          :disabled="isWorking || store.isBusy || !!snapshot.decision"
          class="btn-primary"
          @click="handleBackupNow"
        >
          <span :class="store.isBusy ? 'inline-block animate-spin' : ''">🔄</span>
          پشتیبان‌گیری همین حالا
        </button>

        <button
          type="button"
          :disabled="isWorking"
          class="btn-danger"
          @click="handleDisconnect"
        >
          قطع اتصال
        </button>
      </template>
    </div>

    <!-- زیرپنل رمزنگاری سمت کلاینت -->
    <div class="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/60">
      <div class="flex items-center gap-1.5">
        <span class="text-base" aria-hidden="true">🔐</span>
        <h3 class="text-xs font-bold text-slate-800 dark:text-slate-200">رمزنگاری سرتاسری اختیاری (Zero-Knowledge)</h3>
      </div>

      <template v-if="snapshot.encryptionEnabled">
        <div class="flex items-start gap-2 rounded-lg bg-teal-50 p-2.5 text-xs text-teal-800 dark:bg-teal-950/40 dark:text-teal-200">
          <span class="text-base shrink-0">🛡️</span>
          <div>
            <strong class="font-bold">رمزنگاری استاندارد AES-GCM ۲۵۶ فعال است.</strong>
            <p class="mt-0.5 text-[11px] leading-relaxed text-teal-700 dark:text-teal-300">
              داده‌ها پیش از خروج از دستگاه شما رمز می‌شوند و حتی گوگل هم به محتوای سلامت شما دسترسی ندارد.
            </p>
          </div>
        </div>
        <div>
          <button
            type="button"
            :disabled="isWorking"
            class="text-xs text-rose-600 underline hover:text-rose-700 dark:text-rose-400"
            @click="handleDisableEncryption"
          >
            غیرفعال‌سازی رمزنگاری
          </button>
        </div>
      </template>

      <template v-else>
        <p class="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          بدون رمزنگاری، محتوا به صورت فایل استاندارد ذخیره می‌شود. با فعال‌سازی، فایل‌ها با کلید مشتق‌شده از گذرواژه شما (PBKDF2 با ۶۰۰٬۰۰۰ دور) رمز می‌شوند.
          <strong class="text-rose-600 dark:text-rose-400 block mt-1">هشدار: در صورت فراموشی گذرواژه، اطلاعات ابری هرگز قابل بازیابی نخواهد بود.</strong>
        </p>

        <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div class="field">
            <label>گذرواژه رمزنگاری (حداقل {{ minLength }} نویسه):</label>
            <input
              v-model="passphrase"
              type="password"
              placeholder="گذرواژه قوی..."
            />
          </div>
          <div class="field">
            <label>تکرار گذرواژه:</label>
            <input
              v-model="passphraseConfirm"
              type="password"
              placeholder="تکرار همان گذرواژه..."
            />
          </div>
        </div>

        <div>
          <button
            type="button"
            :disabled="isWorking || passphrase.length < minLength || passphrase !== passphraseConfirm"
            class="btn-soft"
            @click="handleEnableEncryption"
          >
            🛡️ فعال‌سازی رمزنگاری
          </button>
        </div>
      </template>
    </div>

    <!-- تنظیمات اعلان و بازگشت -->
    <div class="flex flex-col gap-2 pt-1 text-xs">
      <label class="flex cursor-pointer items-center gap-2 text-slate-600 dark:text-slate-400">
        <input
          type="checkbox"
          class="size-4 rounded accent-teal-600"
          :checked="snapshot.notifyFailures"
          @change="store.setNotifyFailures(($event.target as HTMLInputElement).checked)"
        />
        <span>نمایش نوار هشدار پایین صفحه در صورت عدم موفقیت همگام‌سازی (فقط در حالت آنلاین)</span>
      </label>

      <div
        v-if="snapshot.hasRollbackSnapshot"
        class="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-amber-50 p-2.5 text-xs text-amber-800 ring-1 ring-amber-200/80 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-800/40"
      >
        <span>پیش از آخرین بازیابی ابری، نسخه‌ی محلی ذخیره شده است.</span>
        <button
          type="button"
          :disabled="isWorking"
          class="btn-soft text-xs"
          @click="handleRollback"
        >
          ↩️ بازگرداندن نسخه پیش از بازیابی
        </button>
      </div>
    </div>
  </PageCard>
</template>
