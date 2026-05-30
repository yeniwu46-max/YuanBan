import { useApiMode } from '@/config/apiMode'
import { useSessionStore } from '@/stores/session'
import { useElderStore } from '@/stores/elder'
import { useHealthStore } from '@/stores/health'
import { useGuardianStore } from '@/stores/guardian'
import { useFamilyReportStore } from '@/stores/familyReport'
import { useCareStore } from '@/stores/care'
import { useCommunityDashboardStore } from '@/stores/communityDashboard'
import { useCommunityWorkorderStore } from '@/stores/communityWorkorder'
import { useCommunityActivityStore } from '@/stores/communityActivity'
import { useCommunityProfileStore } from '@/stores/communityProfile'
import { useCompanionStore } from '@/stores/companion'
import { syncFamilyDerivedState } from '@/stores/familySync'
import type { UserRole } from '@/types/family'

/** 按角色并行预热 Tab 页所需数据（不阻塞 UI） */
export async function prefetchForRole(role?: UserRole) {
  if (!useApiMode()) return

  const session = useSessionStore()
  const activeRole = role ?? session.role
  const elderId = session.primaryElderId

  if (activeRole === 'elder') {
    const elder = useElderStore()
    const health = useHealthStore()
    const companion = useCompanionStore()
    await Promise.all([
      elder.hydrate(elderId, { force: false }),
      health.hydrate(elderId, { force: false }),
      companion.hydrate(elderId, { force: false })
    ])
    return
  }

  if (activeRole === 'family') {
    const guardian = useGuardianStore()
    await guardian.hydrate({ force: false })
    syncFamilyDerivedState()
    const targetElderId = guardian.currentElderId || elderId
    const report = useFamilyReportStore()
    const care = useCareStore()
    await Promise.all([
      report.hydrate(targetElderId, 'week', { force: false }),
      care.hydrate(targetElderId, { force: false }),
      care.hydrateNotificationRules({ force: false })
    ])
    return
  }

  if (activeRole === 'community') {
    const dashboard = useCommunityDashboardStore()
    const workorders = useCommunityWorkorderStore()
    const activity = useCommunityActivityStore()
    const profile = useCommunityProfileStore()
    await Promise.all([
      dashboard.hydrate({ force: false }),
      workorders.fetchOrders(),
      activity.hydrate({ force: false }),
      profile.hydrate(elderId, { force: false })
    ])
  }
}

/** Tab 页 onShow：有缓存时静默刷新 */
export function refreshInBackground(task: () => Promise<void>) {
  void task()
}
