type CacheEntry<T> = {
  data: T
  fetchedAt: number
}

type HydrateOptions = {
  force?: boolean
  ttlMs?: number
}

const DEFAULT_TTL_MS = 30_000

const cache = new Map<string, CacheEntry<unknown>>()
const inflight = new Map<string, Promise<unknown>>()

export function isFresh(key: string, ttlMs = DEFAULT_TTL_MS) {
  const entry = cache.get(key)
  if (!entry) return false
  return Date.now() - entry.fetchedAt < ttlMs
}

export function getCached<T>(key: string): T | undefined {
  return cache.get(key)?.data as T | undefined
}

export function setCached<T>(key: string, data: T) {
  cache.set(key, { data, fetchedAt: Date.now() })
}

export function invalidateCache(prefix?: string) {
  if (!prefix) {
    cache.clear()
    return
  }
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key)
    }
  }
}

export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: HydrateOptions = {}
): Promise<T> {
  const ttlMs = options.ttlMs ?? DEFAULT_TTL_MS
  if (!options.force && isFresh(key, ttlMs)) {
    return getCached<T>(key) as T
  }

  const pending = inflight.get(key)
  if (pending && !options.force) {
    return pending as Promise<T>
  }

  const task = (async () => {
    try {
      const data = await fetcher()
      setCached(key, data)
      return data
    } finally {
      inflight.delete(key)
    }
  })()

  inflight.set(key, task)
  return task
}

export type { HydrateOptions }
