import { defineStore } from 'pinia'
import { useApiMode } from '@/config/apiMode'
import { cloneWorkOrders, getWorkOrdersByTab, staffDuties, workorderPoolStats, workOrders } from '@/mock/community'
import { finishWorkOrder, listWorkOrders } from '@/services/communityService'
import { computePoolStats, mapWorkOrderDto } from '@/utils/apiMappers'
import type { DashboardStats, StaffDuty, WorkOrder, WorkOrderTab } from '@/types/community'

export const useCommunityWorkorderStore = defineStore('communityWorkorder', {
  state: () => ({
    activeTab: 'urgent' as WorkOrderTab,
    orders: cloneWorkOrders(workOrders),
    poolStats: { ...workorderPoolStats } as DashboardStats,
    staff: staffDuties.map((s) => ({ ...s })) as StaffDuty[],
    loading: false,
    apiError: '' as string
  }),
  getters: {
    filteredOrders(state): WorkOrder[] {
      return getWorkOrdersByTab(state.activeTab, state.orders)
    }
  },
  actions: {
    async fetchOrders() {
      if (!useApiMode()) return
      this.loading = true
      this.apiError = ''
      try {
        const dtos = await listWorkOrders()
        this.orders = dtos.map(mapWorkOrderDto)
        this.poolStats = computePoolStats(this.orders)
      } catch (e) {
        this.apiError = e instanceof Error ? e.message : '加载工单失败'
        uni.showToast({ title: '工单加载失败，使用本地演示数据', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    setTab(tab: WorkOrderTab) {
      this.activeTab = tab
    },
    async finishOrder(orderId: string) {
      const order = this.orders.find((o) => o.id === orderId)
      if (!order || order.tab === 'done') return

      if (useApiMode()) {
        try {
          await finishWorkOrder(orderId)
          await this.fetchOrders()
          return
        } catch {
          uni.showToast({ title: '完成工单失败', icon: 'none' })
          return
        }
      }

      order.tab = 'done'
      order.status = 'resolved'
      order.tag = '已完成'
      order.tagTone = 'green'
      if (this.poolStats.pendingCount > 0) this.poolStats.pendingCount -= 1
      if (orderId === 'wo-sos-018' && this.poolStats.urgentCount > 0) {
        this.poolStats.urgentCount -= 1
      }
      this.poolStats.doneCount += 1
    },
    moveUrgentToDone(orderId: string) {
      return this.finishOrder(orderId)
    }
  }
})
