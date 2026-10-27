import { defineStore } from 'pinia'
import { useApiMode } from '@/config/apiMode'
import { fetchMetricHistoryApi } from '@/services/elderService'
import { healthMetricDetails } from '@/mock/elder'
import { historyKey, mockRecordTime, normalizeHistory } from '@/utils/trends'
import type { TrendSeries } from '@/types/presentation'
type Entry = {
  status: 'loading' | 'ready' | 'error'
  data?: TrendSeries
  error?: string
  loadedAt?: number
}
const pending = new Map<string, Promise<void>>()
export const useTrendStore = defineStore('trend', {
  state: () => ({ entries: {} as Record<string, Entry> }),
  actions: {
    key(elderId: string, metric: string, days: number) {
      return historyKey(useApiMode() ? 'api' : 'mock', elderId, metric, days)
    },
    async load(elderId: string, metric: string, days: number, force = false) {
      const key = this.key(elderId, metric, days)
      if (pending.has(key)) return pending.get(key)
      const old = this.entries[key]
      if (!force && old?.status === 'ready' && Date.now() - (old.loadedAt || 0) < 60000) return
      this.entries[key] = { status: 'loading' }
      const request = (async () => {
        try {
          const source = useApiMode() ? 'api' : 'mock'
          const rows =
            source === 'api'
              ? await fetchMetricHistoryApi(elderId, metric, days)
              : elderId === 'elder-001'
                ? (healthMetricDetails.find((m) => m.key === metric)?.records || []).map((r) => ({
                    recorded_at: mockRecordTime(r.time),
                    value: r.value,
                    status: r.status,
                  }))
                : []
          this.entries[key] = {
            status: 'ready',
            data: normalizeHistory({ elderId, metric, days, source, rows }),
            loadedAt: Date.now(),
          }
        } catch {
          this.entries[key] = {
            status: 'error',
            error: '历史记录加载失败，请检查网络后重试。未使用演示数据替代测量结果。',
          }
        } finally {
          pending.delete(key)
        }
      })()
      pending.set(key, request)
      return request
    },
  },
})
