import { onScopeDispose, ref } from 'vue'

export type BreathingPhase = 'idle' | 'inhale' | 'exhale'

/** Guided breathing: configurable inhale/exhale seconds, runs for a chosen number of minutes. */
export function useBreathing(inhaleSeconds = 4, exhaleSeconds = 6) {
  var phase = ref<BreathingPhase>('idle')
  var cycles = ref(0)
  var remainingSeconds = ref(0)
  var phaseTimer: ReturnType<typeof setTimeout> | null = null
  var clock: ReturnType<typeof setInterval> | null = null

  function schedule(next: Exclude<BreathingPhase, 'idle'>): void {
    phase.value = next
    var seconds = next === 'inhale' ? inhaleSeconds : exhaleSeconds
    phaseTimer = setTimeout(() => {
      if (next === 'exhale') cycles.value += 1
      schedule(next === 'inhale' ? 'exhale' : 'inhale')
    }, seconds * 1000)
  }

  function stop(): void {
    if (phaseTimer) clearTimeout(phaseTimer)
    if (clock) clearInterval(clock)
    phaseTimer = null
    clock = null
    phase.value = 'idle'
  }

  function start(minutes: number): void {
    stop()
    cycles.value = 0
    remainingSeconds.value = Math.round(minutes * 60)
    schedule('inhale')
    clock = setInterval(() => {
      remainingSeconds.value -= 1
      if (remainingSeconds.value <= 0) stop()
    }, 1000)
  }

  onScopeDispose(stop)
  return { phase, cycles, remainingSeconds, start, stop }
}
