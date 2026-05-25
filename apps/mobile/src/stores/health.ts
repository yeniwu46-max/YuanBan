import { defineStore } from 'pinia'
import { getHealthMetricDetail, getHealthMetrics, getMedicines } from '@/services/elderService'
import type { HealthMetric } from '@/types/elder'

export const useHealthStore = defineStore('health', {
  state: () => ({
    metrics: getHealthMetrics(),
    medicines: getMedicines(),
    reportTab: 'week' as 'day' | 'week' | 'month',
    medicineMessage: '',
    voiceMessage: ''
  }),
  getters: {
    metricByKey: (state) => (key: string) => state.metrics.find((item) => item.key === key),
    metricDetail: () => (key: HealthMetric['key']) => getHealthMetricDetail(key),
    pendingMedicine: (state) => state.medicines.find((item) => item.status === 'pending')
  },
  actions: {
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
