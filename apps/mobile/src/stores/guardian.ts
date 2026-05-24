import { defineStore } from 'pinia'
import { boundElders, guardSummaries } from '@/mock/family'
import { useAlertStore } from '@/stores/alert'
import type { BoundElder, GuardSummary } from '@/types/family'

const SWITCH_DELAY_MS = 120

export const useGuardianStore = defineStore('guardian', {
  state: () => ({
    elders: boundElders,
    summaries: guardSummaries,
    currentElderId: boundElders[0]?.id ?? '',
    switching: false
  }),
  getters: {
    currentElder(state): BoundElder | undefined {
      return state.elders.find((item) => item.id === state.currentElderId)
    },
    currentSummary(state): GuardSummary | undefined {
      return state.summaries.find((item) => item.elderId === state.currentElderId)
    }
  },
  actions: {
    initLiveStats() {
      this.syncRiskCounts()
    },
    syncRiskCounts() {
      const alertStore = useAlertStore()
      for (const elder of this.elders) {
        const openCount = alertStore.alertsByElder(elder.id).filter((item) => item.status !== 'resolved').length
        elder.riskCount = openCount
        const summary = this.summaries.find((item) => item.elderId === elder.id)
        if (summary) {
          summary.riskCount = openCount
        }
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
      await new Promise((resolve) => setTimeout(resolve, SWITCH_DELAY_MS))
      this.currentElderId = elderId
      this.switching = false

      const name = this.currentElder?.name ?? '老人'
      uni.showToast({ title: `已切换到${name}`, icon: 'none' })
    }
  }
})
