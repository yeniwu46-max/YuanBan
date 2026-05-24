import { defineStore } from 'pinia'
import { privacyPermissions, yuanqiProgress } from '@/mock/elder'

export const useCompanionStore = defineStore('companion', {
  state: () => ({
    selectedMood: yuanqiProgress.mood,
    points: yuanqiProgress.points,
    todayDone: yuanqiProgress.todayDone,
    todayTotal: yuanqiProgress.todayTotal,
    privacyPermissions
  }),
  getters: {
    progressPercent: (state) => Math.round((state.todayDone / state.todayTotal) * 100)
  },
  actions: {
    setMood(mood: string) {
      this.selectedMood = mood
    },
    togglePermission(key: string) {
      const permission = this.privacyPermissions.find((item) => item.key === key)
      if (permission) permission.enabled = !permission.enabled
    }
  }
})

