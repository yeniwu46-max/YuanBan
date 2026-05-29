import { defineStore } from 'pinia'
import { boundElders, guardSummaries } from '@/mock/family'
import { hydrateGuardianData } from '@/services/familyService'
import { mockClone } from '@/services/mockClone'
import type { HydrateOptions } from '@/services/requestCache'
import type { AlertEvent } from '@/types/family'
import { useAlertStore } from '@/stores/alert'

export const useGuardianStore = defineStore('guardian', {
  state: () => ({
    elders: mockClone(boundElders),
    summaries: mockClone(guardSummaries),
    currentElderId: boundElders[0]?.id ?? '',
    switching: false,
    loading: false
  }),
  getters: {
    currentElder(state) {
      return state.elders.find((item) => item.id === state.currentElderId)
    },
    currentSummary(state) {
      return state.summaries.find((item) => item.elderId === state.currentElderId)
    }
  },
  actions: {
    async hydrate(options: HydrateOptions = {}) {
      this.loading = true
      try {
        const data = await hydrateGuardianData(options)
        this.elders = data.elders
        this.summaries = data.summaries
        if (data.alerts) {
          useAlertStore().setAlerts(data.alerts)
        }
        if (!this.elders.some((item) => item.id === this.currentElderId)) {
          this.currentElderId = this.elders[0]?.id ?? ''
        }
      } catch {
        uni.showToast({ title: '守护数据加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    setCurrentElder(elderId: string) {
      if (this.elders.some((item) => item.id === elderId)) {
        this.currentElderId = elderId
      }
    },
    async switchElder(elderId: string) {
      if (!this.elders.some((item) => item.id === elderId)) return
      if (elderId === this.currentElderId) return

      this.switching = true
      this.currentElderId = elderId
      this.switching = false

      const name = this.currentElder?.name ?? '老人'
      uni.showToast({ title: `已切换到${name}`, icon: 'none' })
    }
  }
})
