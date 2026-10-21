<script setup lang="ts">
import { ref } from 'vue'
import { useHealthStore } from '@application/stores/healthStore'
import { MEAL_LABELS_FA, FOOD_TAG_LABELS_FA, type MealType, type FoodTag } from '@domain/health/NutritionLog'
import PageCard from '@presentation/components/shared/PageCard.vue'

var store = useHealthStore()
var meal = ref<MealType>('breakfast')
var description = ref('')
var selectedTags = ref<FoodTag[]>([])
var waterGlasses = ref(0)
var sweetDrinks = ref(0)

var meals = Object.keys(MEAL_LABELS_FA) as MealType[]
var tags = Object.keys(FOOD_TAG_LABELS_FA) as FoodTag[]

function toggleTag(tag: FoodTag): void {
  selectedTags.value = selectedTags.value.includes(tag)
    ? selectedTags.value.filter((item) => item !== tag)
    : [...selectedTags.value, tag]
}

function save(): void {
  if (!description.value.trim()) return
  store.addNutritionLog(meal.value, description.value.trim(), selectedTags.value, waterGlasses.value, sweetDrinks.value)
  description.value = ''
  selectedTags.value = []
  waterGlasses.value = 0
  sweetDrinks.value = 0
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <PageCard title="ثبت سریع وعده">
      <div class="mb-3 flex flex-wrap gap-2">
        <button
          v-for="item in meals"
          :key="item"
          type="button"
          class="rounded-lg px-3 py-1.5 text-xs"
          :class="meal === item ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'"
          @click="meal = item"
        >
          {{ MEAL_LABELS_FA[item] }}
        </button>
      </div>

      <input
        v-model="description"
        placeholder="مثلاً سالاد و مرغ گریل"
        class="mb-3 w-full rounded-lg bg-slate-100 px-3 py-2 text-sm dark:bg-slate-800"
      />

      <div class="mb-3 flex flex-wrap gap-2">
        <button
          v-for="tag in tags"
          :key="tag"
          type="button"
          class="rounded-full px-3 py-1 text-xs"
          :class="selectedTags.includes(tag) ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'"
          @click="toggleTag(tag)"
        >
          {{ FOOD_TAG_LABELS_FA[tag] }}
        </button>
      </div>

      <div class="mb-4 grid grid-cols-2 gap-3">
        <label class="text-xs">
          لیوان آب
          <input v-model.number="waterGlasses" type="number" min="0" class="mt-1 w-full rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800" />
        </label>
        <label class="text-xs">
          نوشیدنی شیرین
          <input v-model.number="sweetDrinks" type="number" min="0" class="mt-1 w-full rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800" />
        </label>
      </div>

      <button type="button" class="w-full rounded-xl bg-teal-500 py-2.5 text-sm font-medium text-white" @click="save">
        ثبت
      </button>
    </PageCard>

    <PageCard title="سهم هفتگی">
      <ul class="space-y-2 text-sm">
        <li>وعده‌های پرقند: {{ store.nutritionSummary.highSugarMeals }}</li>
        <li>وعده‌های پرسدیم: {{ store.nutritionSummary.highSaltMeals }}</li>
        <li>وعده‌های سرخ‌شده: {{ store.nutritionSummary.friedMeals }}</li>
        <li>میوه و سبزیجات: {{ store.nutritionSummary.vegetableFruitMeals }}</li>
        <li>نوشیدنی شیرین: {{ store.nutritionSummary.sweetDrinks }}</li>
      </ul>
      <p class="mt-3 text-xs text-slate-500">هدف، کاهش تدریجی سهم غذاهای پرقند، پرسدیم و سرخ‌شده است؛ نه ممنوع‌سازی کامل.</p>
    </PageCard>

    <PageCard title="ثبت‌های اخیر">
      <ul class="space-y-2 text-sm">
        <li v-for="log in store.nutritionLogs.slice(0, 10)" :key="log.id" class="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
          <span class="font-medium">{{ MEAL_LABELS_FA[log.meal] }}:</span>
          {{ log.description }}
        </li>
      </ul>
    </PageCard>
  </div>
</template>
