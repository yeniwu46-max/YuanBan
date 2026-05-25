import { defineStore } from 'pinia'
import { getAlbumPhotos, getCareStatsList, getCareTasks, getNotificationRules } from '@/services/familyService'

export const useCareStore = defineStore('care', {
  state: () => ({
    statsList: getCareStatsList(),
    tasks: getCareTasks(),
    photos: getAlbumPhotos(),
    notificationRules: getNotificationRules()
  }),
  getters: {
    statsByElder: (state) => (elderId: string) => state.statsList.find((item) => item.elderId === elderId),
    tasksByElder: (state) => (elderId: string) => state.tasks.filter((item) => item.elderId === elderId),
    pendingTaskCount: (state) => state.tasks.filter((item) => item.status === 'pending').length,
    doneTaskCount: (state) => state.tasks.filter((item) => item.status === 'done').length
  },
  actions: {
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
