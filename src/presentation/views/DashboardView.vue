<script setup lang="ts">
import { computed } from 'vue'
import { useHealthStore } from '@application/stores/healthStore'
import PageCard from '@presentation/components/shared/PageCard.vue'
import Progressbar from '@presentation/components/shared/Progressbar.vue'

var store = useHealthStore()
var todayWater = computed(() =>
  store.nutritionLogs.filter((log) => log.date === new Date().toISOString().slice(0, 10)).reduce((total, log) => total + log.waterGlasses, 0),
)
</script>

<template>
  <div class="flex flex-col gap-4">
    <PageCard title="خلاصهٔ امروز">
      <div class="grid grid-cols-2 gap-3">
        <div class="rounded-xl bg-teal-50 p-3 dark:bg-teal-500/10">
          <p class="text-xs text-slate-500">آب امروز</p>
          <p class="text-xl font-bold">{{ todayWater }} / {{ store.goals.dailyWaterGlasses }}</p>
        </div>
        <div class="rounded-xl bg-sky-50 p-3 dark:bg-sky-500/10">
          <p class="text-xs text-slate-500">فعالیت هفته</p>
          <p class="text-xl font-bold">{{ store.activityPercentage }}٪</p>
        </div>
      </div>
      <div class="mt-4">
        <Progressbar :value="store.activityPercentage" label="پیشرفت فعالیت هفتگی" />
      </div>
    </PageCard>

    <PageCard title="اهداف هفتگی">
      <ul class="space-y-2 text-sm">
        <li>فعالیت متوسط: {{ store.activitySummary.moderateMinutes }} از {{ store.goals.weeklyModerateMinutes }} دقیقه</li>
        <li>فعالیت شدید: {{ store.activitySummary.vigorousMinutes }} از {{ store.goals.weeklyVigorousMinutes }} دقیقه</li>
        <li>تمرین قدرتی: {{ store.activitySummary.strengthDays }} از {{ store.goals.strengthDays }} روز</li>
        <li>وعده‌های پرقند: {{ store.nutritionSummary.highSugarMeals }} از {{ store.goals.weeklyHighSugarMeals }}</li>
      </ul>
    </PageCard>

    <PageCard>
      <p class="text-xs leading-6 text-slate-500">
        اهداف پیش‌فرض بر پایهٔ توصیه‌های عمومی WHO تنظیم شده‌اند و برای شرایط پزشکی خاص باید توسط پزشک تغییر کنند.
      </p>
    </PageCard>
  </div>
</template>
