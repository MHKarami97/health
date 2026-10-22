<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAppStore } from '@application/stores/appStore'
import {
  LIMIT_TAGS, MEAL_LABELS, POSITIVE_TAGS, QUICK_MEALS, TAG_LABELS,
  type FoodTag, type MealType,
} from '@domain/health/NutritionLog'
import { ALTERNATIVES, NutritionTargets } from '@domain/health/NutritionTargets'
import PageCard from '@presentation/components/shared/PageCard.vue'
import ProgressBar from '@presentation/components/shared/ProgressBar.vue'
import Counter from '@presentation/components/shared/Counter.vue'
import DisclaimerBanner from '@presentation/components/shared/DisclaimerBanner.vue'
import { useAction } from '@presentation/composables/useAction'

var store = useAppStore()
var action = useAction()

var title = ref('')
var meal = ref<MealType>('lunch')
var tags = ref<FoodTag[]>([])
var calories = ref<number | null>(null)

var meals = Object.keys(MEAL_LABELS) as MealType[]
var allTags = [...LIMIT_TAGS, ...POSITIVE_TAGS]
var goals = computed(() => store.current.goals)
var targets = computed(() => new NutritionTargets(store.current.settings.energyTarget, goals.value))

var shares = computed(() => [
  { tag: 'high-sugar' as FoodTag, label: 'قند زیاد', limit: goals.value.weeklyHighSugarMeals },
  { tag: 'high-salt' as FoodTag, label: 'نمک زیاد', limit: goals.value.weeklyHighSaltMeals },
  { tag: 'fried' as FoodTag, label: 'سرخ‌شده', limit: goals.value.weeklyFriedMeals },
])

function toggleTag(tag: FoodTag): void {
  tags.value = tags.value.includes(tag) ? tags.value.filter((item) => item !== tag) : [...tags.value, tag]
}

function shareText(count: number, limit: number): string {
  if (count === limit) return 'دقیقاً به سهم هفتگی رسیده‌اید'
  return count < limit ? `${limit - count} نوبت تا سهم هفتگی باقی مانده` : `${count - limit} نوبت بیشتر از سهم هفتگی`
}

function quickAdd(index: number): void {
  var item = QUICK_MEALS[index]
  void action.run(() => store.addMeal(item.title, item.meal, item.tags), `«${item.title}» ثبت شد`)
}

async function saveCustom(): Promise<void> {
  var ok = await action.run(() => {
    if (!title.value.trim()) throw new Error('شرح وعده را بنویسید')
    store.addMeal(title.value, meal.value, tags.value, store.current.settings.trackCalories ? calories.value : null)
  }, 'وعده ثبت شد')
  if (ok) {
    title.value = ''
    tags.value = []
    calories.value = null
  }
}
</script>

<template>
  <DisclaimerBanner />

  <PageCard title="ثبت سریع وعده">
    <div class="flex flex-wrap gap-2">
      <button v-for="(item, index) in QUICK_MEALS" :key="item.title" type="button" class="chip-off" @click="quickAdd(index)">{{ item.title }}</button>
    </div>
    <details class="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
      <summary class="cursor-pointer text-sm">ثبت دلخواه</summary>
      <form class="mt-3 flex flex-col gap-3" @submit.prevent="saveCustom">
        <div class="flex flex-wrap gap-2">
          <button v-for="item in meals" :key="item" type="button" :class="meal === item ? 'chip-on' : 'chip-off'" @click="meal = item">{{ MEAL_LABELS[item] }}</button>
        </div>
        <input v-model="title" placeholder="مثلاً خورش سبزی" maxlength="80" />
        <div class="flex flex-wrap gap-2">
          <button v-for="tag in allTags" :key="tag" type="button" :class="tags.includes(tag) ? 'chip-on' : 'chip-off'" @click="toggleTag(tag)">{{ TAG_LABELS[tag] }}</button>
        </div>
        <label v-if="store.current.settings.trackCalories" class="field">
          کالری (اختیاری)
          <input v-model.number="calories" type="number" min="0" inputmode="numeric" />
        </label>
        <button type="submit" class="btn-primary">ثبت</button>
      </form>
    </details>
  </PageCard>

  <PageCard title="آب و نوشیدنی شیرین">
    <div class="grid gap-3 sm:grid-cols-2">
      <Counter label="لیوان آب" :value="store.todayDrinks.water" :goal="goals.dailyWaterGlasses" @increment="store.addDrink('water', 1)" @decrement="store.addDrink('water', -1)" />
      <Counter label="نوشیدنی شیرین" :value="store.todayDrinks.sweet" tone="amber" @increment="store.addDrink('sweet', 1)" @decrement="store.addDrink('sweet', -1)" />
    </div>
    <p class="muted">این هفته: {{ store.weekSweetDrinks }} نوشیدنی شیرین (سهم هفتگی شما {{ goals.weeklySweetDrinks }}). نوشیدنی‌های شیرین جزو منابع قند آزاد هستند.</p>
  </PageCard>

  <PageCard title="سهم هفتگی من">
    <div v-for="item in shares" :key="item.tag" class="flex flex-col gap-1">
      <ProgressBar :percent="item.limit ? (store.tagCounts[item.tag] / item.limit) * 100 : 100" :label="item.label" :detail="`${store.tagCounts[item.tag]} از ${item.limit}`" />
      <p class="muted">{{ shareText(store.tagCounts[item.tag], item.limit) }}</p>
    </div>
    <p class="text-sm">میوه و سبزی این هفته: {{ store.tagCounts.fruit + store.tagCounts.vegetables }} نوبت · چربی مفید: {{ store.tagCounts['unsaturated-fat'] }} نوبت</p>
    <p class="muted">هدف، رسیدن به تعادل است؛ هیچ غذایی «ممنوع» نیست. سهم‌ها را در تنظیمات تغییر دهید.</p>
  </PageCard>

  <PageCard title="سقف‌های روزانهٔ WHO">
    <p class="muted">بر اساس انرژی روزانهٔ {{ store.current.settings.energyTarget }} کیلوکالری. این عدد را در <RouterLink to="/settings" class="underline">تنظیمات</RouterLink> تغییر دهید.</p>
    <ul class="flex flex-col gap-3">
      <li v-for="cap in targets.caps()" :key="cap.key" class="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
        <p class="text-sm font-medium">{{ cap.label }}: {{ cap.value }}</p>
        <p v-if="cap.hint" class="muted">{{ cap.hint }}</p>
      </li>
    </ul>
    <p v-if="store.current.settings.trackCalories" class="text-sm">کالری ثبت‌شدهٔ امروز: {{ store.todayCalories }} از {{ store.current.settings.energyTarget }}</p>
    <p class="muted">سقف‌ها برای جمعیت عمومی است و در دیابت، فشار خون بالا یا سایر بیماری‌ها ممکن است پزشک عدد دیگری بدهد.</p>
  </PageCard>

  <PageCard title="جایگزین‌های پیشنهادی">
    <ul class="list-disc space-y-1 ps-5 text-sm leading-7">
      <li v-for="item in ALTERNATIVES" :key="item">{{ item }}</li>
    </ul>
    <p class="muted">به گفتهٔ WHO چربی ترانس بیشتر در غذاهای فرآوری‌شده، فست‌فود، تنقلات، سرخ‌شده‌ها، پیتزای فریز، پای، کلوچه و مارگارین دیده می‌شود. برچسب‌های «فرآوری‌شده»، «سرخ‌شده»، «نمک زیاد» و «قند زیاد» برای شمارش دفعات هفتگی همین‌جا هستند.</p>
  </PageCard>

  <PageCard v-if="store.current.nutritionLogs.length" title="ثبت‌های اخیر">
    <ul class="flex flex-col gap-2">
      <li v-for="log in store.current.nutritionLogs.slice(0, 12)" :key="log.id" class="flex items-center justify-between gap-2 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800/60">
        <span>
          <b>{{ MEAL_LABELS[log.meal] }}:</b> {{ log.title }}
          <span v-if="log.calories" class="muted">· {{ log.calories }} kcal</span>
          <span class="muted"> {{ log.tags.map((tag) => TAG_LABELS[tag]).join('، ') }}</span>
        </span>
        <button type="button" class="text-xs text-rose-500" :aria-label="`حذف ${log.title}`" @click="store.removeMeal(log.id)">حذف</button>
      </li>
    </ul>
  </PageCard>
</template>
