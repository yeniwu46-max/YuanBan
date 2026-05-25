import { defineStore } from 'pinia'
import { getSosState, updateSosState } from '@/services/elderService'
import type { SosState } from '@/types/elder'

export const useSosStore = defineStore('sos', {
  state: () => ({
    state: getSosState(),
    notifiedCount: 0,
    targetCount: 3,
    timeline: ['女儿', '儿子', '社区服务站']
  }),
  actions: {
    setState(state: SosState) {
      this.state = updateSosState(state)
      this.notifiedCount = state === 'calling' ? 2 : state === 'success' ? 3 : 0
    }
  }
})
