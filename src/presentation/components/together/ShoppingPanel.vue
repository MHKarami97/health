<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '@application/stores/appStore'
import PageCard from '@presentation/components/shared/PageCard.vue'
import { useAction } from '@presentation/composables/useAction'

var store = useAppStore()
var action = useAction()
var text = ref('')

function add(): void {
  store.addShopping(text.value)
  text.value = ''
}

function fromPlan(): void {
  var existing = new Set(store.shared.shopping.map((item) => item.text))
  var added = 0
  Object.values(store.shared.mealPlan).forEach((day) => {
    Object.values(day).forEach((meal) => {
      var item = meal?.trim()
      if (item && !existing.has(item)) {
        store.addShopping(item)
        existing.add(item)
        added += 1
      }
    })
  })
  void action.run(() => {
    if (!added) throw new Error('موردی برای افزودن در برنامه پیدا نشد')
  }, `${added} مورد از برنامه اضافه شد`)
}

function clearDone(): void {
  store.shared.shopping.filter((item) => item.done).forEach((item) => store.removeShopping(item.id))
}
</script>

<template>
  <PageCard title="لیست خرید">
    <form class="flex gap-2" @submit.prevent="add">
      <input v-model="text" placeholder="مثلاً سبزی خوردن" maxlength="60" />
      <button type="submit" class="btn-primary shrink-0">افزودن</button>
    </form>
    <ul class="flex flex-col gap-2">
      <li v-for="item in store.shared.shopping" :key="item.id" class="flex items-center justify-between gap-2 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800/60">
        <label class="flex items-center gap-2" :class="{ 'line-through opacity-60': item.done }">
          <input type="checkbox" :checked="item.done" class="size-4" @change="store.toggleShopping(item)" />
          {{ item.text }}
        </label>
        <button type="button" class="text-xs text-rose-500" :aria-label="`حذف ${item.text}`" @click="store.removeShopping(item.id)">حذف</button>
      </li>
    </ul>
    <p v-if="!store.shared.shopping.length" class="muted">لیست خالی است.</p>
    <div class="grid gap-2 sm:grid-cols-2">
      <button type="button" class="btn-soft" @click="fromPlan">ساخت از برنامهٔ غذایی</button>
      <button type="button" class="btn-soft" @click="clearDone">پاک کردن خریدهای انجام‌شده</button>
    </div>
  </PageCard>
</template>
