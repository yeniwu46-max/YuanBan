import { defineStore } from 'pinia'
import { elderServiceProfile } from '@/mock/community'
import type { ElderServiceProfile } from '@/types/community'

export const useCommunityProfileStore = defineStore('communityProfile', {
  state: () => ({
    profile: JSON.parse(JSON.stringify(elderServiceProfile)) as ElderServiceProfile
  }),
  actions: {
    setElderId(_elderId: string) {
      // MVP：仅李奶奶档案，后续可扩展多老人
    }
  }
})
