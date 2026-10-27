import { defineStore } from 'pinia'
import { dashboardStats, focusElders, opsMetrics, todayActivityCard, urgentWorkItems } from '@/mock/community'
import { fetchDashboard } from '@/services/communityService'
import { useApiMode } from '@/config/apiMode'
import { useCommunityWorkorderStore } from '@/stores/communityWorkorder'
import type { HydrateOptions } from '@/services/requestCache'
import type { DashboardStats, FocusElderItem, OpsMetric, TodayActivityCard, UrgentWorkItem } from '@/types/community'

export const useCommunityDashboardStore = defineStore('communityDashboard', {
  state: () => ({
    stats: { ...dashboardStats } as DashboardStats,
    urgentItems: urgentWorkItems.map((i) => ({ ...i })) as UrgentWorkItem[],
    ops: opsMetrics.map((m) => ({ ...m })) as OpsMetric[],
    todayActivity: { ...todayActivityCard } as TodayActivityCard,
    focusList: focusElders.map((e) => ({ ...e })) as FocusElderItem[],
    loading: false
  }),
  actions: {
    async hydrate(options: HydrateOptions = {}) {
      if (!useApiMode()) {
        const workorders = useCommunityWorkorderStore()
        this.syncFromWorkorderPool(workorders.poolStats)
        this.urgentItems = workorders.orders.filter(o => o.tab === 'urgent').map(o => ({id:o.id,icon:o.icon,iconTone:o.iconTone,title:o.title,description:o.description,tag:o.tag,tagTone:o.tagTone}))
        return
      }
      this.loading = true
      try {
        const data = await fetchDashboard(options)
        this.stats = data.stats
        this.urgentItems = data.urgentItems
        this.ops = data.ops
        this.todayActivity = data.todayActivity
        this.focusList = data.focusList
      } catch {
        uni.showToast({ title: '看板加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    onWorkOrderFinished(workOrderId: string) {
      const item = this.urgentItems.find((i) => i.id === workOrderId)
      if (item) {
        this.urgentItems = this.urgentItems.filter((i) => i.id !== workOrderId)
      }
      if (this.stats.pendingCount > 0) this.stats.pendingCount -= 1
      if (this.stats.urgentCount > 0) this.stats.urgentCount -= 1
      this.stats.doneCount += 1
    },
    syncFromWorkorderPool(pool: DashboardStats) {
      this.stats = { ...pool }
    }
  }
})
