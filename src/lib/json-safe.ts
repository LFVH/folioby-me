export function serializeJsonSafe<T>(value: T): T {
  if (typeof value === 'bigint') {
    return Number(value) as T
  }

  if (value instanceof Date) {
    return value as T
  }

  if (Array.isArray(value)) {
    return value.map((item) => serializeJsonSafe(item)) as T
  }

  if (value && typeof value === 'object') {
    const prototype = Object.getPrototypeOf(value)

    if (prototype !== Object.prototype && prototype !== null) {
      return value as T
    }

    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [
        key,
        serializeJsonSafe(item),
      ])
    ) as T
  }

  return value
}
