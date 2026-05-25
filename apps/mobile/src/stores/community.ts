import { defineStore } from 'pinia'
import { communitySite } from '@/mock/community'
import type { CommunitySite } from '@/types/community'

export const useCommunityStore = defineStore('community', {
  state: () => ({
    site: { ...communitySite } as CommunitySite
  })
})
