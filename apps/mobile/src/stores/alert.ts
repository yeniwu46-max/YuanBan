import { defineStore } from 'pinia'
import { useApiMode } from '@/config/apiMode'
import { fetchAlertsApi, getAlerts, patchAlertApi } from '@/services/familyService'
import { mapAlertDto } from '@/utils/apiMappers'
import type { AlertEvent, AlertStatus } from '@/types/family'

function initialAlerts() {
  const list = getAlerts()
  return { alerts: list, activeAlertId: list[0]?.id ?? '' }
}

export const useAlertStore = defineStore('alert', {
  state: () => ({
    ...initialAlerts(),
    loading: false
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
    async hydrate(elderId?: string) {
      if (!useApiMode()) {
        this.alerts = getAlerts(elderId)
        if (!this.activeAlertId && this.alerts[0]) {
          this.activeAlertId = this.alerts[0].id
        }
        return
      }
      this.loading = true
      try {
        const dtos = await fetchAlertsApi(elderId)
        this.alerts = dtos.map(mapAlertDto)
        const stillActive = this.alerts.some((a) => a.id === this.activeAlertId)
        if (!stillActive && this.alerts[0]) {
          this.activeAlertId = this.alerts[0].id
        }
      } catch {
        uni.showToast({ title: '告警同步失败', icon: 'none' })
      } finally {
        this.loading = false
      }
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
    },
    async confirmAlert(alertId: string) {
      const target = this.alerts.find((item) => item.id === alertId)
      if (!target) return
      if (useApiMode()) {
        try {
          await patchAlertApi(alertId, 'processing', '处理中')
          await this.hydrate(target.elderId)
          return
        } catch {
          uni.showToast({ title: '更新告警失败', icon: 'none' })
          return
        }
      }
      target.status = 'processing'
      target.statusLabel = '处理中'
      const pendingStep = target.timeline.find((step) => step.pending)
      if (pendingStep) {
        pendingStep.done = true
        pendingStep.pending = false
        pendingStep.detail = '刚刚 · 已确认查看'
      }
    },
    async resolveAlert(alertId: string) {
      const target = this.alerts.find((item) => item.id === alertId)
      if (!target) return
      if (useApiMode()) {
        try {
          await patchAlertApi(alertId, 'resolved', '已处理')
          await this.hydrate(target.elderId)
          return
        } catch {
          uni.showToast({ title: '关闭告警失败', icon: 'none' })
          return
        }
      }
      target.status = 'resolved'
      target.statusLabel = '已处理'
      target.tag = '已处理'
      target.tagTone = 'normal'
    },
    async markPending(alertId: string) {
      const target = this.alerts.find((item) => item.id === alertId)
      if (!target) return
      if (useApiMode()) {
        try {
          await patchAlertApi(alertId, 'processing', '稍后处理')
          await this.hydrate(target.elderId)
          return
        } catch {
          uni.showToast({ title: '更新告警失败', icon: 'none' })
          return
        }
      }
      target.status = 'processing'
      target.statusLabel = '稍后处理'
      target.tag = '处理中'
      target.tagTone = 'warm'
    }
  }
})
