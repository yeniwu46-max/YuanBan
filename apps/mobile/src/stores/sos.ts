import { defineStore } from 'pinia'
import { useApiMode } from '@/config/apiMode'
import { getPrimaryElderId } from '@/utils/authContext'
import { getSosState, updateSosState } from '@/services/elderService'
import { triggerSimulator } from '@/services/communityService'
import type { SosState } from '@/types/elder'

export const useSosStore = defineStore('sos', {
  state: () => ({
    state: getSosState(),
    notifiedCount: 0,
    targetCount: 3,
    timeline: ['女儿', '儿子', '社区服务站'],
    triggering: false
  }),
  actions: {
    async setState(state: SosState) {
      if (useApiMode() && state === 'calling' && this.state !== 'calling') {
        this.triggering = true
        try {
          await triggerSimulator('sos', getPrimaryElderId())
          uni.showToast({ title: '已通知子女与社区', icon: 'none' })
        } catch {
          uni.showToast({ title: '求助上报失败，请重试', icon: 'none' })
          this.triggering = false
          return
        } finally {
          this.triggering = false
        }
      }

      this.state = updateSosState(state)
      this.notifiedCount = state === 'calling' ? 2 : state === 'success' ? 3 : 0
    }
  }
})
