import { defineStore } from 'pinia'
import { activityOverview, checkInRecords, communityActivities } from '@/mock/community'
import { fetchActivities } from '@/services/communityService'
import type { HydrateOptions } from '@/services/requestCache'
import type { ActivityOverview, CheckInRecord, CommunityActivityItem } from '@/types/community'

export const useCommunityActivityStore = defineStore('communityActivity', {
  state: () => ({
    overview: { ...activityOverview } as ActivityOverview,
    activities: communityActivities.map((a) => ({ ...a })) as CommunityActivityItem[],
    checkIns: checkInRecords.map((c) => ({ ...c })) as CheckInRecord[],
    loading: false
  }),
  actions: {
    async hydrate(options: HydrateOptions = {}) {
      this.loading = true
      try {
        const data = await fetchActivities(options)
        this.overview = data.overview
        this.activities = data.activities
        this.checkIns = data.checkIns
      } catch {
        uni.showToast({ title: '活动加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    }
  }
})
