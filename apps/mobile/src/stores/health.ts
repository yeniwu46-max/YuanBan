import { defineStore } from 'pinia'
import { healthMetricDetails, healthMetrics, medicines } from '@/mock/elder'
import { hydrateHealthMetrics } from '@/services/elderService'
import { mockClone } from '@/services/mockClone'
import type { HydrateOptions } from '@/services/requestCache'
import type { HealthMetric } from '@/types/elder'

export const useHealthStore = defineStore('health', {
  state: () => ({
    metrics: mockClone(healthMetrics),
    medicines: mockClone(medicines),
    reportTab: 'week' as 'day' | 'week' | 'month',
    medicineMessage: '',
    voiceMessage: '',
    loading: false
  }),
  getters: {
    metricByKey: (state) => (key: string) => state.metrics.find((item) => item.key === key),
    metricDetail: () => (key: HealthMetric['key']) => {
      return mockClone(healthMetricDetails.find((item) => item.key === key))
    },
    pendingMedicine: (state) => state.medicines.find((item) => item.status === 'pending')
  },
  actions: {
    async hydrate(elderId = 'elder-001', options: HydrateOptions = {}) {
      this.loading = true
      try {
        this.metrics = await hydrateHealthMetrics(elderId, options)
      } catch {
        uni.showToast({ title: '体征加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    setReportTab(tab: 'day' | 'week' | 'month') {
      this.reportTab = tab
    },
    markPendingMedicineDone() {
      const pending = this.medicines.find((item) => item.status === 'pending')
      if (pending) {
        pending.status = 'done'
        this.medicineMessage = `${pending.name}已记录为已服用`
      } else {
        this.medicineMessage = '今天的用药已经全部完成'
      }
    },
    delayPendingMedicine() {
      const pending = this.medicines.find((item) => item.status === 'pending')
      if (pending) {
        pending.status = 'later'
        this.medicineMessage = `已为${pending.name}设置稍后提醒`
      } else {
        this.medicineMessage = '暂无需要稍后提醒的药品'
      }
    },
    playVoiceSummary(message = '小鼋正在为您播报健康情况') {
      this.voiceMessage = message
    }
  }
})
