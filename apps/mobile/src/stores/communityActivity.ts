import { defineStore } from 'pinia'
import {
  activityOverview,
  checkInRecords,
  communityActivities
} from '@/mock/community'
import type {
  ActivityOverview,
  CheckInRecord,
  CommunityActivityItem
} from '@/types/community'

export const useCommunityActivityStore = defineStore('communityActivity', {
  state: () => ({
    overview: { ...activityOverview } as ActivityOverview,
    activities: communityActivities.map((a) => ({ ...a })) as CommunityActivityItem[],
    checkIns: checkInRecords.map((c) => ({ ...c })) as CheckInRecord[]
  })
})
