import { defineStore } from 'pinia'
import { healthReportSummaries, reportAnomalies } from '@/mock/family'
import type { AlertEvent } from '@/types/family'

export const useFamilyReportStore = defineStore('familyReport', {
  state: () => ({
    reports: healthReportSummaries,
    anomalies: [...reportAnomalies]
  }),
  getters: {
    reportByElder: (state) => (elderId: string) => state.reports.find((item) => item.elderId === elderId),
    anomaliesByElder: (state) => (elderId: string) => state.anomalies.filter((item) => item.elderId === elderId)
  },
  actions: {
    syncFromAlerts(alerts: AlertEvent[]) {
      for (const anomaly of this.anomalies) {
        if (!anomaly.alertId) continue
        const alert = alerts.find((item) => item.id === anomaly.alertId)
        if (!alert) continue
        anomaly.tag = alert.tag
        anomaly.tagTone = alert.tagTone
      }
      for (const report of this.reports) {
        const openCount = alerts.filter(
          (item) => item.elderId === report.elderId && item.status !== 'resolved'
        ).length
        report.riskCount = openCount
      }
    }
  }
})
