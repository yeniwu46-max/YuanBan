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
    finishedHeadline: '工单已完成',
    finishedDescription: '社区人员已确认老人安全。'
  }
}

export const useCommunityAlertStore = defineStore('communityAlert', {
  state: () => ({
    activeOrderId: sosWorkOrderDetail.id,
    detail: JSON.parse(JSON.stringify(sosWorkOrderDetail)) as WorkOrderDetail,
    finished: false,
    error: '',
    loading: false
  }),
  getters: {
    progressLabel(state): string {
      return state.finished ? '已完成' : '正在响应'
    },
    heroTone(state): 'red' | 'green' {
      return state.finished ? 'green' : 'red'
    }
  },
  actions: {
    async loadById(orderId: string) {
      this.activeOrderId = orderId
      this.error = ''
      this.finished = false
      if (!useApiMode()) {
        const order = useCommunityWorkorderStore().orders.find(item => item.id === orderId)
        this.finished = order?.status === 'resolved'
        this.detail = { ...JSON.parse(JSON.stringify(sosWorkOrderDetail)), id:orderId,
          code:order?.code ?? '', headline:order?.title ?? '工单不存在', description:order?.description ?? '请返回工单列表重新选择。',
          elderId:order?.elderId ?? sosWorkOrderDetail.elderId, statusLabel:order?.tag ?? '未知',
          finishedHeadline:'工单已完成', liveMetrics:[],
          timeline:[{id:orderId+'-created',title:'收到工单',detail:order?.description ?? '',done:true},
            {id:orderId+'-result',title:this.finished?'处理已完成':'等待核实安全',detail:this.finished?'已记录处理结果':'请先联系长辈或前往现场',done:this.finished,pending:!this.finished}]
        }
        return
      }
      this.loading = true
      try {
        const dto = await getWorkOrderDetail(orderId)
        this.detail = mapDetailDto(dto)
        this.finished = dto.status === 'resolved'
      } catch {
        this.error = '工单详情加载失败，请返回列表后重试。未展示上一条工单的处置信息。'
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
    async finish(result = '已核实长辈安全') {
      if (this.finished) return true
      const workorder = useCommunityWorkorderStore()
      if (!await workorder.finishOrder(this.activeOrderId)) return false
      this.finished = true
      this.detail.statusLabel = '完成'
      this.detail.statusTone = 'normal'
      this.detail.elapsedLabel = '刚刚完成'
      const pending = this.detail.timeline.find((s) => s.pending)
      if (pending) {
        pending.done = true
        pending.pending = false
        pending.detail = new Date().toLocaleTimeString('zh-CN', {hour:'2-digit',minute:'2-digit'}) + ' · ' + result
      }
      const dashboard = useCommunityDashboardStore()
      dashboard.onWorkOrderFinished(this.activeOrderId)
      dashboard.syncFromWorkorderPool({ ...workorder.poolStats })
      return true
    },
    resetFollowUp() {
      this.finished = false
      void this.loadById(this.activeOrderId)
    }
  }
})
