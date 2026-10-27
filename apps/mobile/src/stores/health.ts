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
import { isMetricUsable } from '@/utils/trends'

export const useHealthStore = defineStore('health', {
  state: () => ({
    metrics: useApiMode() ? [] as HealthMetric[] : mockClone(healthMetrics),
    medicines: useApiMode() ? [] as typeof medicines : mockClone(medicines),
    dataSource: (useApiMode() ? 'unknown' : 'mock') as 'api' | 'mock' | 'unknown',
    loadedElderId: '',
    requestVersion: 0,
    error: '',
    metricHistory: {} as Record<string, Array<{ recorded_at: string; value: string; status: string }>>,
    reportTab: 'week' as 'day' | 'week' | 'month',
    medicineMessage: '',
    voiceMessage: '',
    loading: false
  }),
  getters: {
    summaryTitle: (state) => {
      if (state.loading) return '正在更新'
      if (state.error) return '数据待更新'
      const candidates = state.metrics.filter(m => m.key !== 'medicine')
      const rows = candidates.filter(isMetricUsable)
      if (!rows.length) return '暂无健康数据'
      const count = rows.filter(m => m.status === 'warning' || m.status === 'danger').length
      return count ? count + '项需关注' : rows.length < candidates.length ? '部分数据缺失' : '指标平稳'
    },
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
      if (!useApiMode()) return
      this.loading = true
      const id = elderId ?? getPrimaryElderId()
      const version = ++this.requestVersion
      this.error = ''
      if (this.loadedElderId !== id) {
        this.metrics = []
        this.medicines = []
        this.dataSource = 'unknown'
        this.metricHistory = {}
      }
      try {
        const [metrics, meds] = await Promise.all([
          hydrateHealthMetrics(id, options),
          hydrateMedicines(id, options)
        ])
        if (version !== this.requestVersion) return
        this.loadedElderId = id
        this.dataSource = 'api'
        this.metrics = metrics
        this.medicines = meds
      } catch {
        if (version !== this.requestVersion) return
        this.error = '健康数据更新失败'
        uni.showToast({ title: '体征加载失败', icon: 'none' })
      } finally {
        if (version === this.requestVersion) this.loading = false
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
