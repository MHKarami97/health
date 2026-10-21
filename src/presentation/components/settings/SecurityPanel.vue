<script setup lang="ts">
import { ref } from 'vue'
import { useLockStore } from '@application/stores/lockStore'
import { BrowserNotifier } from '@infrastructure/notifications/BrowserNotifier'
import PageCard from '@presentation/components/shared/PageCard.vue'
import { useAction } from '@presentation/composables/useAction'

var lockStore = useLockStore()
var action = useAction()
var notifier = new BrowserNotifier()
var current = ref('')
var next = ref('')
var confirmation = ref('')
var permission = ref(notifier.permission)

async function save(): Promise<void> {
  var ok = await action.run(async () => {
    if (next.value !== confirmation.value) throw new Error('تکرار رمز با رمز جدید یکی نیست')
    await lockStore.setPassword(next.value, current.value)
  }, 'رمز عبور ذخیره شد')
  if (ok) current.value = next.value = confirmation.value = ''
}

async function remove(): Promise<void> {
  var ok = await action.run(() => lockStore.removePassword(current.value), 'رمز عبور حذف شد')
  if (ok) current.value = ''
}

async function askPermission(): Promise<void> {
  permission.value = await notifier.requestPermission()
}
</script>

<template>
  <PageCard title="رمز عبور و قفل برنامه">
    <p class="muted">رمز فقط ورود به برنامه را قفل می‌کند و داده‌های ذخیره‌شده در مرورگر را رمزنگاری نمی‌کند. روی دستگاه مشترک از قفل صفحهٔ خود دستگاه هم استفاده کنید.</p>
    <form class="grid gap-2" @submit.prevent="save">
      <input v-if="lockStore.isEnabled" v-model="current" type="password" placeholder="رمز فعلی" autocomplete="current-password" dir="ltr" />
      <input v-model="next" type="password" placeholder="رمز جدید (حداقل ۶ کاراکتر)" autocomplete="new-password" dir="ltr" />
      <input v-model="confirmation" type="password" placeholder="تکرار رمز جدید" autocomplete="new-password" dir="ltr" />
      <button type="submit" class="btn-primary">{{ lockStore.isEnabled ? 'تغییر رمز' : 'فعال‌سازی رمز' }}</button>
    </form>
    <template v-if="lockStore.isEnabled">
      <label class="field">قفل خودکار بعد از (دقیقه، ۰ = خاموش)
        <input type="number" min="0" max="120" :value="lockStore.autoLockMinutes" @change="lockStore.setAutoLockMinutes(Number(($event.target as HTMLInputElement).value))" />
      </label>
      <button type="button" class="btn-danger" @click="remove">حذف رمز (رمز فعلی را بالا وارد کنید)</button>
    </template>
  </PageCard>

  <PageCard title="اعلان‌ها">
    <p class="muted">وضعیت اجازهٔ اعلان: {{ permission === 'granted' ? 'داده شده' : permission === 'denied' ? 'مسدود شده (از تنظیمات مرورگر باز کنید)' : permission === 'unsupported' ? 'پشتیبانی نمی‌شود' : 'هنوز پرسیده نشده' }}</p>
    <button v-if="permission === 'default'" type="button" class="btn-soft" @click="askPermission">درخواست اجازهٔ اعلان</button>
  </PageCard>
</template>
