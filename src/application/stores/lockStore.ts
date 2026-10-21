import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { LocalStorageRepository } from '@infrastructure/storage/LocalStorageRepository'
import { PasswordHasher, type PasswordRecord } from '@infrastructure/security/PasswordHasher'

var LOCK_KEY = 'salamat-lock-v1'
var MIN_PASSWORD_LENGTH = 6

interface LockConfig {
  password: PasswordRecord | null
  autoLockMinutes: number
}

/** App lock gates the UI. It does not encrypt data stored in the browser. */
export var useLockStore = defineStore('lock', () => {
  var repository = new LocalStorageRepository()
  var hasher = new PasswordHasher()
  var config = ref<LockConfig>(repository.load<LockConfig>(LOCK_KEY, { password: null, autoLockMinutes: 5 }))
  var isLocked = ref(config.value.password !== null)
  var isEnabled = computed(() => config.value.password !== null)
  var autoLockMinutes = computed(() => config.value.autoLockMinutes)

  function persist(): void {
    repository.save(LOCK_KEY, config.value)
  }

  function assertValid(password: string): void {
    if (password.length < MIN_PASSWORD_LENGTH) throw new Error(`رمز عبور باید حداقل ${MIN_PASSWORD_LENGTH} کاراکتر باشد`)
  }

  async function verify(password: string): Promise<boolean> {
    return config.value.password ? hasher.verify(password, config.value.password) : true
  }

  async function unlock(password: string): Promise<boolean> {
    var ok = await verify(password)
    if (ok) isLocked.value = false
    return ok
  }

  function lock(): void {
    if (isEnabled.value) isLocked.value = true
  }

  async function setPassword(password: string, currentPassword = ''): Promise<void> {
    if (isEnabled.value && !(await verify(currentPassword))) throw new Error('رمز فعلی درست نیست')
    assertValid(password)
    config.value.password = await hasher.create(password)
    persist()
  }

  async function removePassword(currentPassword: string): Promise<void> {
    if (!(await verify(currentPassword))) throw new Error('رمز فعلی درست نیست')
    config.value.password = null
    isLocked.value = false
    persist()
  }

  function setAutoLockMinutes(minutes: number): void {
    config.value.autoLockMinutes = Math.max(0, Math.round(minutes))
    persist()
  }

  return { isLocked, isEnabled, autoLockMinutes, unlock, lock, setPassword, removePassword, setAutoLockMinutes }
})
