import { defineStore } from 'pinia'
import { alertEvents } from '@/mock/family'
import { useFamilyReportStore } from '@/stores/familyReport'
import { useGuardianStore } from '@/stores/guardian'
import type { AlertEvent, AlertStatus } from '@/types/family'

function syncFamilyState(alerts: AlertEvent[]) {
  useGuardianStore().syncRiskCounts()
  useFamilyReportStore().syncFromAlerts(alerts)
}

export const useAlertStore = defineStore('alert', {
  state: () => ({
    alerts: alertEvents,
    activeAlertId: alertEvents[0]?.id ?? ''
  }),
  getters: {
    activeAlerts: (state) => state.alerts.filter((item) => item.status !== 'resolved'),
    alertsByElder: (state) => (elderId: string) => state.alerts.filter((item) => item.elderId === elderId),
    sortedAlertsByElder: (state) => (elderId: string) => {
      const list = state.alerts.filter((item) => item.elderId === elderId)
      return [...list].sort((a, b) => {
        const rank = (status: AlertEvent['status']) => (status === 'resolved' ? 1 : 0)
        return rank(a.status) - rank(b.status)
      })
    },
    activeAlert(state): AlertEvent | undefined {
      return state.alerts.find((item) => item.id === state.activeAlertId)
    }
  },
  actions: {
    initLiveStats() {
      syncFamilyState(this.alerts)
    },
    setActiveAlert(alertId: string) {
      if (this.alerts.some((item) => item.id === alertId)) {
        this.activeAlertId = alertId
      }
    },
    updateAlertStatus(alertId: string, status: AlertStatus, statusLabel: string) {
      const target = this.alerts.find((item) => item.id === alertId)
      if (!target) return
      target.status = status
      target.statusLabel = statusLabel
      syncFamilyState(this.alerts)
    },
    confirmAlert(alertId: string) {
      const target = this.alerts.find((item) => item.id === alertId)
      if (!target) return
      target.status = 'processing'
      target.statusLabel = '处理中'
      const pendingStep = target.timeline.find((step) => step.pending)
      if (pendingStep) {
        pendingStep.done = true
        pendingStep.pending = false
        pendingStep.detail = '刚刚 · 已确认查看'
      }
      syncFamilyState(this.alerts)
    },
    resolveAlert(alertId: string) {
      const target = this.alerts.find((item) => item.id === alertId)
      if (!target) return
      target.status = 'resolved'
      target.statusLabel = '已处理'
      target.tag = '已处理'
      target.tagTone = 'normal'
      syncFamilyState(this.alerts)
    },
    markPending(alertId: string) {
      const target = this.alerts.find((item) => item.id === alertId)
      if (!target) return
      target.status = 'processing'
      target.statusLabel = '稍后处理'
      target.tag = '处理中'
      target.tagTone = 'warm'
      syncFamilyState(this.alerts)
    }
  }
})
