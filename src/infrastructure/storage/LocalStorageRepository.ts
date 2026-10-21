export interface StorageRepository {
  load<T>(key: string, fallback: T): T
  save<T>(key: string, value: T): void
}

export class LocalStorageRepository implements StorageRepository {
  load<T>(key: string, fallback: T): T {
    var raw = localStorage.getItem(key)
    if (!raw) return fallback
    try {
      return JSON.parse(raw) as T
    } catch {
      return fallback
    }
  }

  save<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value))
  }
}
