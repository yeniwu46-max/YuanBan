import { defineStore } from 'pinia'
import { healthMetricDetails, healthMetrics, medicines } from '@/mock/elder'
import {
  fetchMetricHistoryApi,
  hydrateHealthMetrics,
  hydrateMedicines,
  patchMedicineApi
} from '@/services/elderService'
import { useApiMode } from '@/config/apiMode'
import { getPrimaryElderId } from '@/utils/authContext'
import { mockClone } from '@/services/mockClone'
import type { HydrateOptions } from '@/services/requestCache'
import type { HealthMetric } from '@/types/elder'

export const useHealthStore = defineStore('health', {
  state: () => ({
    metrics: mockClone(healthMetrics),
    medicines: mockClone(medicines),
    metricHistory: {} as Record<string, Array<{ recorded_at: string; value: string; status: string }>>,
    reportTab: 'week' as 'day' | 'week' | 'month',
    medicineMessage: '',
    voiceMessage: '',
    loading: false
  }),
  getters: {
    metricByKey: (state) => (key: string) => state.metrics.find((item) => item.key === key),
    metricDetail: (state) => (key: HealthMetric['key']) => {
      const metric = state.metrics.find((m) => m.key === key)
      const mockDetail = healthMetricDetails.find((item) => item.key === key)
      if (!useApiMode() || !metric || !mockDetail) {
        return mockClone(mockDetail)
      }
      const history = state.metricHistory[key] ?? []
      return {
        ...mockClone(mockDetail),
        key,
        headline: metric.description || mockDetail.headline,
        records: history.length
          ? history.map((h, i) => ({
              id: `h${i}`,
              time: h.recorded_at.slice(0, 16).replace('T', ' '),
              value: h.value,
              status: (h.status === 'warning' ? 'warning' : 'normal') as 'normal' | 'warning' | 'danger'
            }))
          : mockDetail.records
      }
    },
    pendingMedicine: (state) => state.medicines.find((item) => item.status === 'pending')
  },
  actions: {
    async hydrate(elderId?: string, options: HydrateOptions = {}) {
      this.loading = true
      const id = elderId ?? getPrimaryElderId()
      try {
        const [metrics, meds] = await Promise.all([
          hydrateHealthMetrics(id, options),
          hydrateMedicines(id, options)
        ])
        this.metrics = metrics
        this.medicines = meds
      } catch {
        uni.showToast({ title: '体征加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    async hydrateMetricHistory(elderId: string, metricKey: string) {
      if (!useApiMode()) return
      try {
        this.metricHistory[metricKey] = await fetchMetricHistoryApi(elderId, metricKey)
      } catch {
        /* ignore */
      }
    },
    setReportTab(tab: 'day' | 'week' | 'month') {
      this.reportTab = tab
    },
    async markPendingMedicineDone(elderId?: string) {
      const pending = this.medicines.find((item) => item.status === 'pending')
      if (!pending) {
        this.medicineMessage = '今天的用药已经全部完成'
        return
      }
      if (useApiMode()) {
        await patchMedicineApi(elderId ?? getPrimaryElderId(), pending.id, 'done')
      }
      pending.status = 'done'
      this.medicineMessage = `${pending.name}已记录为已服用`
    },
    async delayPendingMedicine(elderId?: string) {
      const pending = this.medicines.find((item) => item.status === 'pending')
      if (!pending) {
        this.medicineMessage = '暂无需要稍后提醒的药品'
        return
      }
      if (useApiMode()) {
        await patchMedicineApi(elderId ?? getPrimaryElderId(), pending.id, 'later')
      }
      pending.status = 'later'
      this.medicineMessage = `已为${pending.name}设置稍后提醒`
    },
    playVoiceSummary(message = '小鼋正在为您播报健康情况') {
      this.voiceMessage = message
    }
  }
})
