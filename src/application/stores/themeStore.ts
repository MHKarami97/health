import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { LocalStorageRepository } from '@infrastructure/storage/LocalStorageRepository'

export type ThemeMode = 'system' | 'light' | 'dark'

var THEME_KEY = 'salamat-theme-v1'

interface ThemeState {
  mode: ThemeMode
}

export var useThemeStore = defineStore('theme', () => {
  var repository = new LocalStorageRepository()
  var state = ref<ThemeState>(repository.load<ThemeState>(THEME_KEY, { mode: 'system' }))
  var systemPrefersDark = ref(
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches,
  )

  var mode = computed<ThemeMode>(() => state.value.mode)
  var isDark = computed(() =>
    state.value.mode === 'dark' || (state.value.mode === 'system' && systemPrefersDark.value),
  )

  function persist(): void {
    repository.save(THEME_KEY, state.value)
  }

  function setMode(next: ThemeMode): void {
    state.value.mode = next
    persist()
  }

  function applyTheme(): void {
    document.documentElement.classList.toggle('dark', isDark.value)
    var meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', isDark.value ? '#020617' : '#0f766e')
  }

  function listenToSystemTheme(): void {
    if (typeof window === 'undefined') return
    var query = window.matchMedia('(prefers-color-scheme: dark)')
    systemPrefersDark.value = query.matches

    query.addEventListener('change', (event) => {
      systemPrefersDark.value = event.matches
    })
  }

  watch(isDark, applyTheme, { immediate: true })
  listenToSystemTheme()

  return { mode, isDark, setMode }
})