import { defineStore } from 'pinia'
import { sosWorkOrderDetail } from '@/mock/community'
import { useCommunityDashboardStore } from '@/stores/communityDashboard'
import { useCommunityWorkorderStore } from '@/stores/communityWorkorder'
import type { WorkOrderDetail } from '@/types/community'

export const useCommunityAlertStore = defineStore('communityAlert', {
  state: () => ({
    activeOrderId: sosWorkOrderDetail.id,
    detail: JSON.parse(JSON.stringify(sosWorkOrderDetail)) as WorkOrderDetail,
    finished: false
  }),
  getters: {
    progressLabel(state): string {
      return state.finished ? '已闭环' : '正在响应'
    },
    heroTone(state): 'red' | 'green' {
      return state.finished ? 'green' : 'red'
    }
  },
  actions: {
    loadById(orderId: string) {
      if (orderId === sosWorkOrderDetail.id || orderId === 'wo-sos-018') {
        this.activeOrderId = sosWorkOrderDetail.id
        if (!this.finished) {
          this.detail = JSON.parse(JSON.stringify(sosWorkOrderDetail))
        }
      }
    },
    markViewed() {
      const step = this.detail.timeline.find((s) => s.pending)
      if (step && !this.finished) {
        step.detail = '社区人员已打开工单'
      }
    },
    async finish() {
      if (this.finished) return
      this.finished = true
      this.detail.statusLabel = '完成'
      this.detail.statusTone = 'normal'
      this.detail.elapsedLabel = '8分'
      const pending = this.detail.timeline.find((s) => s.pending)
      if (pending) {
        pending.done = true
        pending.pending = false
        pending.detail = '09:26 · 电话确认老人安全'
      }
      const dashboard = useCommunityDashboardStore()
      const workorder = useCommunityWorkorderStore()
      await workorder.finishOrder(this.activeOrderId)
      dashboard.onWorkOrderFinished(this.activeOrderId)
      dashboard.syncFromWorkorderPool({ ...workorder.poolStats })
    },
    resetFollowUp() {
      this.finished = false
      this.detail = JSON.parse(JSON.stringify(sosWorkOrderDetail))
    }
  }
})
