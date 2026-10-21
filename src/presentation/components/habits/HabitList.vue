<script setup lang="ts">
import { reactive } from 'vue'
import { useAppStore } from '@application/stores/appStore'
import { HabitStreak, type HabitScope } from '@domain/health/Habit'
import { DateOnly } from '@domain/valueObjects/DateOnly'
import PageCard from '@presentation/components/shared/PageCard.vue'
import { useAction } from '@presentation/composables/useAction'

var store = useAppStore()
var action = useAction()
var form = reactive({ title: '', scope: 'personal' as HabitScope, reminderTime: '' })
var suggestions = ['مسواک', 'نخ دندان', 'مصرف ۸ لیوان آب', 'کشش صبحگاهی']

function datesOf(habitId: string, profileId: string): string[] {
  return store.shared.habits.find((item) => item.id === habitId)?.completions[profileId] ?? []
}

function streakOf(habitId: string, profileId: string): number {
  return HabitStreak.current(datesOf(habitId, profileId), DateOnly.parse(store.todayKey))
}

function isDone(habitId: string): boolean {
  return datesOf(habitId, store.current.profile.id).includes(store.todayKey)
}

async function add(): Promise<void> {
  var ok = await action.run(() => store.addHabit(form.title, form.scope, form.reminderTime || null), 'عادت اضافه شد')
  if (ok) Object.assign(form, { title: '', reminderTime: '' })
}
</script>

<template>
  <PageCard title="عادت‌های روزانه">
    <ul class="flex flex-col gap-2">
      <li v-for="habit in store.visibleHabits" :key="habit.id" class="flex flex-col gap-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
        <div class="flex items-center justify-between gap-2">
          <span class="text-sm">{{ habit.title }} <span v-if="habit.scope === 'shared'" class="muted">(مشترک)</span><span v-if="habit.reminderTime" class="muted"> ⏰ {{ habit.reminderTime }}</span></span>
          <span class="flex items-center gap-2">
            <button type="button" :class="isDone(habit.id) ? 'chip-on' : 'chip-off'" @click="store.toggleHabit(habit.id)">{{ isDone(habit.id) ? 'انجام شد ✓' : 'ثبت امروز' }}</button>
            <button type="button" class="text-xs text-rose-500" :aria-label="`حذف ${habit.title}`" @click="store.removeHabit(habit.id)">حذف</button>
          </span>
        </div>
        <p class="muted">
          <template v-if="habit.scope === 'shared'"><span v-for="profile in store.profiles" :key="profile.id">{{ profile.name }}: {{ streakOf(habit.id, profile.id) }} روز پیاپی &nbsp;</span></template>
          <template v-else>{{ streakOf(habit.id, store.current.profile.id) }} روز پیاپی</template>
        </p>
      </li>
    </ul>
    <p v-if="!store.visibleHabits.length" class="muted">هنوز عادتی ندارید. یکی از پیشنهادها را انتخاب کنید یا عادت خودتان را بنویسید.</p>
    <div class="flex flex-wrap gap-2">
      <button v-for="item in suggestions" :key="item" type="button" class="chip-off" @click="form.title = item">{{ item }}</button>
    </div>
    <form class="grid gap-2 sm:grid-cols-4" @submit.prevent="add">
      <input v-model="form.title" placeholder="عنوان عادت" class="sm:col-span-2" maxlength="60" />
      <input v-model="form.reminderTime" type="time" aria-label="ساعت یادآور" />
      <select v-model="form.scope" aria-label="نوع عادت"><option value="personal">شخصی</option><option value="shared">مشترک</option></select>
      <button type="submit" class="btn-primary sm:col-span-4">افزودن عادت</button>
    </form>
  </PageCard>
</template>
