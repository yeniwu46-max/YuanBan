import { defineStore } from 'pinia'
import { albumPhotos, careStatsList, careTasks, notificationRules } from '@/mock/family'
import { hydrateCareData, hydrateNotificationRules, patchCareTaskApi, patchNotificationRulesApi } from '@/services/familyService'
import { useApiMode } from '@/config/apiMode'
import { mockClone } from '@/services/mockClone'
import type { HydrateOptions } from '@/services/requestCache'

export const useCareStore = defineStore('care', {
  state: () => ({
    statsList: mockClone(careStatsList),
    tasks: mockClone(careTasks),
    photos: mockClone(albumPhotos),
    notificationRules: mockClone(notificationRules),
    loading: false,
    completingTaskId: null as string | null
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
    async hydrateNotificationRules(options: HydrateOptions = {}) {
      this.notificationRules = await hydrateNotificationRules(options)
    },
    toggleNotificationRule(key: string) {
      const target = this.notificationRules.find((item) => item.key === key)
      if (target) {
        void this.setNotificationRule(key, !target.enabled)
      }
    },
    async setNotificationRule(key: string, enabled: boolean) {
      const target = this.notificationRules.find((item) => item.key === key)
      if (target) {
        target.enabled = enabled
      }
      if (!useApiMode()) return
      try {
        const payload = this.notificationRules.map((r) => ({
          key: r.key,
          label: r.title,
          description: r.description,
          enabled: r.enabled
        }))
        const updated = await patchNotificationRulesApi(payload)
        this.notificationRules = updated.map((r) => ({
          key: r.key,
          icon: '🔔',
          title: r.label,
          description: r.description,
          enabled: r.enabled
        }))
      } catch {
        uni.showToast({ title: '通知规则保存失败', icon: 'none' })
      }
    },
    async completeTask(taskId: string) {
      const target = this.tasks.find((item) => item.id === taskId)
      if (!target || target.status === 'done' || this.completingTaskId) return

      this.completingTaskId = taskId
      target.status = 'done'
      const stats = this.statsList.find((item) => item.elderId === target.elderId)
      if (stats && stats.doneCount < stats.totalCount) {
        stats.doneCount += 1
      }

      if (useApiMode()) {
        try {
          await patchCareTaskApi(taskId, 'done')
        } catch {
          target.status = 'pending'
          if (stats && stats.doneCount > 0) stats.doneCount -= 1
          uni.showToast({ title: '任务同步失败，请重试', icon: 'none' })
        }
      }
      this.completingTaskId = null
    }
  }
})
