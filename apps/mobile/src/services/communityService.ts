import { apiRequest } from '@/services/apiClient'
import { cachedFetch, type HydrateOptions } from '@/services/requestCache'
import { useApiMode } from '@/config/apiMode'
import {
  activityOverview,
  checkInRecords,
  communityActivities,
  dashboardStats,
  focusElders,
  elderServiceProfile,
  opsMetrics,
  todayActivityCard,
  urgentWorkItems
} from '@/mock/community'
import { mockClone } from '@/services/mockClone'
import { mapWorkOrderDto } from '@/utils/apiMappers'
import type {
  ActivityOverview,
  CheckInRecord,
  CommunityActivityItem,
  DashboardStats,
  ElderServiceProfile,
  FocusElderItem,
  OpsMetric,
  TodayActivityCard,
  UrgentWorkItem
} from '@/types/community'

export type WorkOrderDto = {
  id: string
  code: string
  elder_id: string | null
  alert_id: string | null
  tab: string
  icon: string
  title: string
  description: string
  tag: string
  tag_tone: string
  status: string
  created_at: string
}

export function listWorkOrders(tab?: string) {
  const q = tab ? `?tab=${encodeURIComponent(tab)}` : ''
  return apiRequest<WorkOrderDto[]>(`/api/v1/work-orders${q}`, { role: 'community', userId: 'community-001' })
}

export function getWorkOrder(id: string) {
  return apiRequest<WorkOrderDto>(`/api/v1/community/work-orders/${id}`, {
    role: 'community',
    userId: 'community-001'
  })
}

export function finishWorkOrder(id: string) {
  return apiRequest<WorkOrderDto>(`/api/v1/work-orders/${id}`, {
    method: 'PATCH',
    role: 'community',
    userId: 'community-001',
    body: { status: 'resolved', tag: '已完成', tag_tone: 'green' }
  })
}

export function triggerSimulator(eventType: 'sos' | 'fall' | 'vitals' | 'offline' | 'low_battery', elderId = 'elder-001') {
  return apiRequest<{ ok: boolean; alert_id?: string }>('/api/v1/simulator/trigger', {
    method: 'POST',
    body: { event_type: eventType, elder_id: elderId, device_id: 'd3', location: '卧室' }
  })
}

type DashboardDto = {
  pending_count: number
  urgent_count: number
  visit_count: number
  activity_count: number
  done_count: number
  total_count: number
  device_online_rate: number
  service_status_label: string
  urgent_items: Array<{
    id: string
    icon: string
    iconTone: string
    title: string
    description: string
    tag: string
    tagTone: string
  }>
  ops_metrics: Array<{
    key: string
    icon: string
    iconTone?: string
    title: string
    value: string
    statusLabel: string
    statusTone?: string
  }>
  today_activity: {
    id: string
    title: string
    timeLabel: string
    location: string
    enrolled: number
    pendingCheckIn: number
    statusLabel: string
    statusTone: string
  } | null
  focus_elders: Array<{
    elderId: string
    icon: string
    iconTone: string
    name: string
    description: string
  }>
}

export async function fetchDashboard(options: HydrateOptions = {}) {
  return cachedFetch('community:dashboard', async () => {
    if (!useApiMode()) {
      return {
        stats: mockClone(dashboardStats),
        urgentItems: mockClone(urgentWorkItems),
        ops: mockClone(opsMetrics),
        todayActivity: mockClone(todayActivityCard),
        focusList: mockClone(focusElders)
      }
    }
    const dto = await apiRequest<DashboardDto>('/api/v1/community/dashboard', {
      role: 'community',
      userId: 'community-001'
    })
    return {
      stats: {
        pendingCount: dto.pending_count,
        urgentCount: dto.urgent_count,
        visitCount: dto.visit_count,
        activityCount: dto.activity_count,
        doneCount: dto.done_count,
        totalCount: dto.total_count
      } satisfies DashboardStats,
      urgentItems: dto.urgent_items.map(
        (i): UrgentWorkItem => ({
          id: i.id,
          icon: i.icon,
          iconTone: i.iconTone as UrgentWorkItem['iconTone'],
          title: i.title,
          description: i.description,
          tag: i.tag,
          tagTone: i.tagTone as UrgentWorkItem['tagTone']
        })
      ),
      ops: dto.ops_metrics.map(
        (m): OpsMetric => ({
          key: m.key,
          icon: m.icon,
          iconTone: m.iconTone as OpsMetric['iconTone'],
          title: m.title,
          value: m.value,
          statusLabel: m.statusLabel,
          statusTone: m.statusTone as OpsMetric['statusTone']
        })
      ),
      todayActivity: dto.today_activity
        ? ({
            id: dto.today_activity.id,
            title: dto.today_activity.title,
            timeLabel: dto.today_activity.timeLabel,
            location: dto.today_activity.location,
            enrolled: dto.today_activity.enrolled,
            pendingCheckIn: dto.today_activity.pendingCheckIn,
            statusLabel: dto.today_activity.statusLabel,
            statusTone: dto.today_activity.statusTone as TodayActivityCard['statusTone']
          } satisfies TodayActivityCard)
        : mockClone(todayActivityCard),
      focusList: dto.focus_elders.map(
        (e): FocusElderItem => ({
          elderId: e.elderId,
          icon: e.icon,
          iconTone: e.iconTone as FocusElderItem['iconTone'],
          name: e.name,
          description: e.description
        })
      )
    }
  }, options)
}

export async function fetchActivities(options: HydrateOptions = {}) {
  return cachedFetch('community:activities', async () => {
    if (!useApiMode()) {
      return {
        overview: mockClone(activityOverview),
        activities: mockClone(communityActivities),
        checkIns: mockClone(checkInRecords)
      }
    }
    const rows = await apiRequest<
      Array<{
        id: string
        title: string
        time_label: string
        location: string
        enrolled: number
        pending_check_in: number
        status_label: string
        status_tone: string
      }>
    >('/api/v1/community/activities', { role: 'community', userId: 'community-001' })
    return {
      overview: mockClone(activityOverview),
      activities: rows.map(
        (a): CommunityActivityItem => ({
          id: a.id,
          icon: '📅',
          iconTone: 'normal',
          title: a.title,
          description: `${a.time_label} · ${a.location} · 报名 ${a.enrolled} 人`,
          tag: a.status_label,
          tagTone: a.status_tone as CommunityActivityItem['tagTone'],
          enrolled: a.enrolled,
          pendingCheckIn: a.pending_check_in
        })
      ),
      checkIns: mockClone(checkInRecords)
    }
  }, options)
}

export async function fetchServiceProfile(elderId: string, options: HydrateOptions = {}) {
  return cachedFetch(`community:profile:${elderId}`, async () => {
    if (!useApiMode()) {
      return mockClone(elderServiceProfile)
    }
    const dto = await apiRequest<{
      elder_id: string
      name: string
      age: number
      address: string
      guard_score: number
      health_summary: string
      recent_orders: WorkOrderDto[]
      metrics: Array<{ key: string; label: string; value: string; unit: string; status: string; description: string }>
    }>(`/api/v1/community/service-profile?elder_id=${encodeURIComponent(elderId)}`, {
      role: 'community',
      userId: 'community-001'
    })
    const base = mockClone(elderServiceProfile)
    const { mapHealthMetricDto } = await import('@/utils/apiMappers')
    return {
      ...base,
      elderId: dto.elder_id,
      name: dto.name,
      age: dto.age,
      address: dto.address,
      healthScore: dto.guard_score,
      metrics: dto.metrics.map(mapHealthMetricDto),
      yuanSuggestion: dto.health_summary,
      serviceRecords: dto.recent_orders.map((o) => ({
        id: o.id,
        icon: o.icon,
        title: o.title,
        detail: o.description
      }))
    } satisfies ElderServiceProfile
  }, options)
}
