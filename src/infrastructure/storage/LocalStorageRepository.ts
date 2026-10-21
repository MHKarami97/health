export interface KeyValueRepository {
  load<T>(key: string, fallback: T): T
  save<T>(key: string, value: T): void
  remove(key: string): void
}

export class LocalStorageRepository implements KeyValueRepository {
  load<T>(key: string, fallback: T): T {
    try {
      var raw = localStorage.getItem(key)
      return raw === null ? fallback : (JSON.parse(raw) as T)
    } catch {
      return fallback
    }
  }

  save<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value))
  }

  remove(key: string): void {
    localStorage.removeItem(key)
  }
}
