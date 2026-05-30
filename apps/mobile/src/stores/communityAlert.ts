import { defineStore } from 'pinia'
import { sosWorkOrderDetail } from '@/mock/community'
import { getWorkOrderDetail } from '@/services/communityService'
import { useApiMode } from '@/config/apiMode'
import { useCommunityDashboardStore } from '@/stores/communityDashboard'
import { useCommunityWorkorderStore } from '@/stores/communityWorkorder'
import type { WorkOrderDetail } from '@/types/community'

function mapDetailDto(dto: Awaited<ReturnType<typeof getWorkOrderDetail>>): WorkOrderDetail {
  return {
    id: dto.id,
    code: dto.code,
    type: (dto.alert_type === 'sos' ? 'sos' : dto.alert_type === 'fall' ? 'fall' : 'other') as WorkOrderDetail['type'],
    priority: dto.priority,
    priorityTone: dto.priority_tone as WorkOrderDetail['priorityTone'],
    elapsedLabel: dto.elapsed_label,
    statusLabel: dto.status_label,
    statusTone: dto.status_tone as WorkOrderDetail['statusTone'],
    headline: dto.title,
    description: dto.description,
    elderId: dto.elder_id ?? '',
    elderName: dto.elder_name,
    elderAge: dto.elder_age,
    elderTags: ['独居', '高风险'] ,
    location: dto.location,
    triggerTime: dto.trigger_time,
    triggerDetail: dto.trigger_detail,
    liveMetrics: [],
    mapAddress: dto.location,
    mapDistance: '约 1.2 公里',
    timeline: dto.timeline.map((s, i) => ({
      id: s.id ?? `t${i}`,
      title: s.title,
      detail: s.detail,
      done: s.done,
      pending: s.pending
    })),
    suggestion: dto.suggestion,
    resultOptions: sosWorkOrderDetail.resultOptions,
    finishedHeadline: '工单已闭环',
    finishedDescription: '社区人员已确认老人安全。'
  }
}

export const useCommunityAlertStore = defineStore('communityAlert', {
  state: () => ({
    activeOrderId: sosWorkOrderDetail.id,
    detail: JSON.parse(JSON.stringify(sosWorkOrderDetail)) as WorkOrderDetail,
    finished: false,
    loading: false
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
    async loadById(orderId: string) {
      this.activeOrderId = orderId
      if (!useApiMode()) {
        if (orderId === sosWorkOrderDetail.id || orderId === 'wo-sos-018') {
          if (!this.finished) {
            this.detail = JSON.parse(JSON.stringify(sosWorkOrderDetail))
          }
        }
        return
      }
      this.loading = true
      try {
        const dto = await getWorkOrderDetail(orderId)
        this.detail = mapDetailDto(dto)
        this.finished = dto.status === 'resolved'
      } catch {
        uni.showToast({ title: '工单详情加载失败', icon: 'none' })
      } finally {
        this.loading = false
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
      void this.loadById(this.activeOrderId)
    }
  }
})
