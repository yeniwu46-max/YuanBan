import { defineStore } from 'pinia'
import { elderServiceProfile } from '@/mock/community'
import { fetchServiceProfile } from '@/services/communityService'
import type { HydrateOptions } from '@/services/requestCache'
import type { ElderServiceProfile } from '@/types/community'

export const useCommunityProfileStore = defineStore('communityProfile', {
  state: () => ({
    profile: JSON.parse(JSON.stringify(elderServiceProfile)) as ElderServiceProfile,
    loading: false
  }),
  actions: {
    async hydrate(elderId = 'elder-001', options: HydrateOptions = {}) {
      this.loading = true
      try {
        this.profile = await fetchServiceProfile(elderId, options)
      } catch {
        uni.showToast({ title: '档案加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    setElderId(elderId: string) {
      void this.hydrate(elderId)
    }
  }
})
