import { defineStore } from 'pinia'
import { albumPhotos, careStatsList, careTasks, notificationRules } from '@/mock/family'
import { hydrateCareData } from '@/services/familyService'
import { mockClone } from '@/services/mockClone'
import type { HydrateOptions } from '@/services/requestCache'

export const useCareStore = defineStore('care', {
  state: () => ({
    statsList: mockClone(careStatsList),
    tasks: mockClone(careTasks),
    photos: mockClone(albumPhotos),
    notificationRules: mockClone(notificationRules),
    loading: false
  }),
  getters: {
    statsByElder: (state) => (elderId: string) => state.statsList.find((item) => item.elderId === elderId),
    tasksByElder: (state) => (elderId: string) => state.tasks.filter((item) => item.elderId === elderId),
    pendingTaskCount: (state) => state.tasks.filter((item) => item.status === 'pending').length,
    doneTaskCount: (state) => state.tasks.filter((item) => item.status === 'done').length
  },
  actions: {
    async hydrate(elderId: string, options: HydrateOptions = {}) {
      this.loading = true
      try {
        const data = await hydrateCareData(elderId, options)
        const existing = this.statsList.filter((s) => s.elderId !== elderId)
        this.statsList = [...existing, ...data.statsList]
        this.tasks = [...this.tasks.filter((t) => t.elderId !== elderId), ...data.tasks]
        this.photos = data.photos
      } catch {
        uni.showToast({ title: '关怀数据加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    toggleNotificationRule(key: string) {
      const target = this.notificationRules.find((item) => item.key === key)
      if (target) {
        target.enabled = !target.enabled
      }
    },
    setNotificationRule(key: string, enabled: boolean) {
      const target = this.notificationRules.find((item) => item.key === key)
      if (target) {
        target.enabled = enabled
      }
    },
    completeTask(taskId: string) {
      const target = this.tasks.find((item) => item.id === taskId)
      if (!target || target.status === 'done') return

      target.status = 'done'
      const stats = this.statsList.find((item) => item.elderId === target.elderId)
      if (stats && stats.doneCount < stats.totalCount) {
        stats.doneCount += 1
      }
    }
  }
})
