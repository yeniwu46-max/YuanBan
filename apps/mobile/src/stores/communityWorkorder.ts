import { defineStore } from 'pinia'
import { cloneWorkOrders, getWorkOrdersByTab, staffDuties, workorderPoolStats, workOrders } from '@/mock/community'
import type { DashboardStats, StaffDuty, WorkOrder, WorkOrderTab } from '@/types/community'

export const useCommunityWorkorderStore = defineStore('communityWorkorder', {
  state: () => ({
    activeTab: 'urgent' as WorkOrderTab,
    orders: cloneWorkOrders(workOrders),
    poolStats: { ...workorderPoolStats } as DashboardStats,
    staff: staffDuties.map((s) => ({ ...s })) as StaffDuty[]
  }),
  getters: {
    filteredOrders(state): WorkOrder[] {
      return getWorkOrdersByTab(state.activeTab, state.orders)
    }
  },
  actions: {
    setTab(tab: WorkOrderTab) {
      this.activeTab = tab
    },
    finishOrder(orderId: string) {
      const order = this.orders.find((o) => o.id === orderId)
      if (!order || order.tab === 'done') return
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
      this.finishOrder(orderId)
    }
  }
})
