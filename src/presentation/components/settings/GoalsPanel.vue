<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useAppStore } from '@application/stores/appStore'
import { DEFAULT_GOALS, type HealthGoals } from '@domain/health/Goals'
import PageCard from '@presentation/components/shared/PageCard.vue'
import SourceLink from '@presentation/components/shared/SourceLink.vue'
import { BrowserNotifier } from '@infrastructure/notifications/BrowserNotifier'
import { useAction } from '@presentation/composables/useAction'

var store = useAppStore()
var action = useAction()
var goals = reactive<HealthGoals>({ ...store.current.goals })
var settings = reactive({ ...store.current.settings })

watch(() => store.current.profile.id, () => {
  Object.assign(goals, store.current.goals)
  Object.assign(settings, store.current.settings)
})

var fields: { key: keyof HealthGoals; label: string; step?: number }[] = [
  { key: 'weeklyAerobicMinutes', label: 'هدف هفتگی فعالیت (دقیقهٔ معادل متوسط)' },
  { key: 'strengthDays', label: 'روز تمرین قدرتی در هفته' },
  { key: 'dailyWaterGlasses', label: 'لیوان آب در روز' },
  { key: 'weeklySweetDrinks', label: 'سهم هفتگی نوشیدنی شیرین' },
  { key: 'weeklyHighSugarMeals', label: 'سهم هفتگی وعدهٔ پرقند' },
  { key: 'weeklyHighSaltMeals', label: 'سهم هفتگی وعدهٔ پرنمک' },
  { key: 'weeklyFriedMeals', label: 'سهم هفتگی وعدهٔ سرخ‌شده' },
  { key: 'freeSugarPercent', label: 'سقف قند آزاد (٪ انرژی)', step: 0.5 },
  { key: 'saltGrams', label: 'سقف نمک (گرم در روز)', step: 0.5 },
  { key: 'saturatedFatPercent', label: 'سقف چربی اشباع (٪ انرژی)', step: 0.5 },
  { key: 'transFatPercent', label: 'سقف چربی ترانس (٪ انرژی)', step: 0.1 },
  { key: 'totalFatPercent', label: 'سقف کل چربی (٪ انرژی)', step: 0.5 },
]

function save(): void {
  void action.run(() => {
    store.updateGoals({ ...goals })
    store.updateSettings({ ...settings })
  }, 'تنظیمات ذخیره شد')
}

function resetToWho(): void {
  Object.assign(goals, DEFAULT_GOALS)
  save()
}

type FlagKey = 'trackBody' | 'trackCalories' | 'remindersEnabled'

async function toggle(key: FlagKey, value: boolean): Promise<void> {
  settings[key] = value
  save()
  var notifier = new BrowserNotifier()
  if (key === 'remindersEnabled' && value && notifier.permission === 'default') await notifier.requestPermission()
}

var toggles = [
  { key: 'trackBody' as const, label: 'ثبت وزن و دور کمر', hint: 'پیش‌فرض خاموش. برای بعضی افراد، پایش عدد می‌تواند آسیب‌زا باشد.' },
  { key: 'trackCalories' as const, label: 'ثبت کالری وعده‌ها', hint: 'پیش‌فرض خاموش. ثبت سریع بدون کالری همیشه در دسترس است.' },
]
</script>

<template>
  <PageCard title="اهداف (قابل ویرایش)">
    <p class="muted">مقادیر پیش‌فرض بر پایهٔ توصیه‌های عمومی WHO برای بزرگسالان است. اگر پزشک عدد دیگری داده، اینجا همان را وارد کنید.</p>
    <div class="grid gap-3 sm:grid-cols-2">
      <label v-for="field in fields" :key="field.key" class="field">
        {{ field.label }}
        <input v-model.number="goals[field.key]" type="number" min="0" :step="field.step ?? 1" inputmode="decimal" />
      </label>
      <label class="field">انرژی روزانه (کیلوکالری، برای تبدیل درصد به گرم)
        <input v-model.number="settings.energyTarget" type="number" min="800" max="5000" step="50" inputmode="numeric" />
      </label>
    </div>
    <div class="flex flex-wrap gap-x-3 gap-y-1"><SourceLink source="whoHealthyDiet" /><SourceLink source="emroFatSaltSugar" /><SourceLink source="whoPhysicalActivity" /></div>
    <div class="grid gap-2 sm:grid-cols-2">
      <button type="button" class="btn-primary" @click="save">ذخیره</button>
      <button type="button" class="btn-soft" @click="resetToWho">بازگشت به پیش‌فرض WHO</button>
    </div>
  </PageCard>

  <PageCard title="حریم شخصی و یادآورها">
    <label v-for="item in toggles" :key="item.key" class="flex items-start gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
      <input type="checkbox" class="mt-1 size-4" :checked="settings[item.key]" @change="toggle(item.key, ($event.target as HTMLInputElement).checked)" />
      <span><span class="text-sm">{{ item.label }}</span><span class="muted block">{{ item.hint }}</span></span>
    </label>
    <label class="flex items-start gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
      <input type="checkbox" class="mt-1 size-4" :checked="settings.remindersEnabled" @change="toggle('remindersEnabled', ($event.target as HTMLInputElement).checked)" />
      <span><span class="text-sm">یادآورها (دارو، نوبت، واکسن، عادت‌ها)</span><span class="muted block">فقط وقتی برنامه باز است کار می‌کند. برای اعلان سیستم، اجازهٔ اعلان لازم است.</span></span>
    </label>
  </PageCard>
</template>
