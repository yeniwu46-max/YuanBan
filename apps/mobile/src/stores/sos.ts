import { defineStore } from 'pinia'
import type { SosState } from '@/types/elder'

export const useSosStore = defineStore('sos', {
  state: () => ({
    state: 'confirm' as SosState,
    notifiedCount: 0,
    targetCount: 3
  }),
  actions: {
    setState(state: SosState) {
      this.state = state
      this.notifiedCount = state === 'calling' ? 2 : state === 'success' ? 3 : 0
    }
  }
})

