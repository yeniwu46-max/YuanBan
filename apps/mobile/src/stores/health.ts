import { defineStore } from 'pinia'
import { healthMetrics, medicines } from '@/mock/elder'

export const useHealthStore = defineStore('health', {
  state: () => ({
    metrics: healthMetrics,
    medicines,
    reportTab: 'week' as 'day' | 'week' | 'month'
  }),
  getters: {
    metricByKey: (state) => (key: string) => state.metrics.find((item) => item.key === key),
    pendingMedicine: (state) => state.medicines.find((item) => item.status === 'pending')
  },
  actions: {
    setReportTab(tab: 'day' | 'week' | 'month') {
      this.reportTab = tab
    },
    markPendingMedicineDone() {
      const pending = this.medicines.find((item) => item.status === 'pending')
      if (pending) pending.status = 'done'
    }
  }
})

