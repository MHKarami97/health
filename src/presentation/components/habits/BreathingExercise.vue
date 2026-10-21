<script setup lang="ts">
import { computed } from 'vue'
import PageCard from '@presentation/components/shared/PageCard.vue'
import { useBreathing } from '@presentation/composables/useBreathing'

var INHALE_SECONDS = 4
var EXHALE_SECONDS = 6
var breathing = useBreathing(INHALE_SECONDS, EXHALE_SECONDS)

var caption = computed(() => ({ idle: 'آماده', inhale: 'دم', exhale: 'بازدم' })[breathing.phase.value])
var minutesLeft = computed(() => `${Math.floor(breathing.remainingSeconds.value / 60)}:${String(breathing.remainingSeconds.value % 60).padStart(2, '0')}`)
var circleStyle = computed(() => ({
  transform: breathing.phase.value === 'inhale' ? 'scale(1)' : 'scale(0.6)',
  transitionDuration: `${breathing.phase.value === 'inhale' ? INHALE_SECONDS : EXHALE_SECONDS}s`,
}))
</script>

<template>
  <PageCard title="تنفس هدایت‌شده">
    <div class="flex flex-col items-center gap-4 py-2">
      <div class="flex size-40 items-center justify-center rounded-full bg-teal-500/20 transition-transform ease-in-out motion-reduce:transition-none" :style="circleStyle" aria-live="polite">
        <span class="text-lg font-semibold text-teal-700 dark:text-teal-200">{{ caption }}</span>
      </div>
      <p v-if="breathing.phase.value !== 'idle'" class="muted">زمان باقی‌مانده {{ minutesLeft }} · {{ breathing.cycles.value }} چرخه</p>
      <div class="flex flex-wrap justify-center gap-2">
        <template v-if="breathing.phase.value === 'idle'">
          <button v-for="minutes in [1, 3, 5]" :key="minutes" type="button" class="btn-primary" @click="breathing.start(minutes)">{{ minutes }} دقیقه</button>
        </template>
        <button v-else type="button" class="btn-soft" @click="breathing.stop()">توقف</button>
      </div>
      <p class="muted text-center">الگو: {{ INHALE_SECONDS }} ثانیه دم و {{ EXHALE_SECONDS }} ثانیه بازدم. این یک تمرین آرام‌سازی ساده است و درمان نیست؛ اگر استرس یا اضطراب شما شدید است با متخصص صحبت کنید.</p>
    </div>
  </PageCard>
</template>
