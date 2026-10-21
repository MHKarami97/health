<script setup lang="ts">
import { useAppStore } from '@application/stores/appStore'
import { MEAL_LABELS, type MealType } from '@domain/health/NutritionLog'
import PageCard from '@presentation/components/shared/PageCard.vue'

var store = useAppStore()
var DAYS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه']
var meals = Object.keys(MEAL_LABELS) as MealType[]

function textOf(day: number, meal: MealType): string {
  return store.shared.mealPlan[String(day)]?.[meal] ?? ''
}
</script>

<template>
  <PageCard title="برنامهٔ غذایی هفتگی مشترک">
    <p class="muted">برنامه برای همهٔ پروفایل‌های این دستگاه یکی است. هفته از شنبه شروع می‌شود.</p>
    <div v-for="(day, index) in DAYS" :key="day" class="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
      <h3 class="mb-2 text-sm font-semibold">{{ day }}</h3>
      <div class="grid gap-2 sm:grid-cols-2">
        <label v-for="meal in meals" :key="meal" class="field">
          {{ MEAL_LABELS[meal] }}
          <input :value="textOf(index, meal)" maxlength="80" @change="store.setMeal(index, meal, ($event.target as HTMLInputElement).value)" />
        </label>
      </div>
    </div>
  </PageCard>
</template>
