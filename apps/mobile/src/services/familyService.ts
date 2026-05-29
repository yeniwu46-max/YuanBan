import {
  alertEvents,
  albumPhotos,
  boundElders,
  careStatsList,
  careTasks,
  familyProfile,
  guardSummaries,
  healthReportSummaries,
  notificationRules,
  recommendedActions,
  reportAnomalies
} from '@/mock/family'
import { useApiMode } from '@/config/apiMode'
import { apiRequest } from '@/services/apiClient'
import { cachedFetch, type HydrateOptions } from '@/services/requestCache'
import { mockClone } from '@/services/mockClone'
import {
  mapElderDtoToProfile,
  mapHealthMetricDto,
  mergeBoundElderFromApi,
  mergeGuardSummaryFromApi,
  mapAlertDto
} from '@/utils/apiMappers'
import type { AlertStatus, ApiReportPeriod, BoundElder, GuardSummary, ReportPeriod } from '@/types/family'
import type { ElderDto, HealthMetricDto } from '@/services/elderService'
import type { AlertEvent, CareTask, HealthReportSummary, NotificationRule } from '@/types/family'

export type AlertDto = {
  id: string
  elder_id: string
  type?: string
  alert_type?: string
  level: string
  icon: string
  title: string
  description: string
  detail: string
  status: string
  status_label: string
  tag: string
  tag_tone: string
  timeline: Array<{ id?: string; title: string; detail: string; done: boolean; pending?: boolean }>
  suggestion?: string
  time_label?: string
}

function toReportPeriod(period: ApiReportPeriod): ReportPeriod {
  const map: Record<ApiReportPeriod, ReportPeriod> = {
    day: 'daily',
    week: 'weekly',
    month: 'monthly'
  }
  return map[period]
}

export function getFamilyProfile() {
  return mockClone(familyProfile)
}

export function getBoundElders() {
  return mockClone(boundElders)
}

export function getGuardSummaries() {
  return mockClone(guardSummaries)
}

export function getGuardSummary(elderId: string) {
  return mockClone(guardSummaries.find((item) => item.elderId === elderId))
}

export function getAlerts(elderId?: string) {
  const alerts = elderId ? alertEvents.filter((item) => item.elderId === elderId) : alertEvents
  return mockClone(alerts)
}

export function getFamilyReports() {
  return mockClone(healthReportSummaries)
}

export function getFamilyReport(elderId: string, period: ApiReportPeriod) {
  const normalized = toReportPeriod(period)
  return mockClone(healthReportSummaries.find((item) => item.elderId === elderId && item.period === normalized))
}

export function getReportAnomalies(elderId?: string) {
  const anomalies = elderId ? reportAnomalies.filter((item) => item.elderId === elderId) : reportAnomalies
  return mockClone(anomalies)
}

export function getCareStatsList() {
  return mockClone(careStatsList)
}

export function getCareTasks(elderId?: string) {
  const tasks = elderId ? careTasks.filter((item) => item.elderId === elderId) : careTasks
  return mockClone(tasks)
}

export function getAlbumPhotos() {
  return mockClone(albumPhotos)
}

export function getNotificationRules() {
  return mockClone(notificationRules)
}

export function getRecommendedActions() {
  return mockClone(recommendedActions)
}

export function fetchAlertsApi(elderId?: string) {
  const q = elderId ? `?elder_id=${encodeURIComponent(elderId)}` : ''
  return apiRequest<AlertDto[]>(`/api/v1/alerts${q}`, {
    role: 'family',
    userId: 'family-001'
  })
}

export function patchAlertApi(alertId: string, status: AlertStatus, statusLabel?: string) {
  return apiRequest<AlertDto>(`/api/v1/alerts/${alertId}`, {
    method: 'PATCH',
    role: 'family',
    userId: 'family-001',
    body: { status, status_label: statusLabel }
  })
}

export function fetchBoundEldersApi() {
  return apiRequest<ElderDto[]>('/api/v1/elders', {
    role: 'family',
    userId: 'family-001'
  })
}

export function fetchFamilyDashboardApi(elderId: string) {
  return apiRequest<{
    elder_id: string
    guard_score: number
    health_score: number
    active_alert_count: number
    device_count: number
    medicine_done_percent: number
    safety_headline: string
    companion_suggestion: string
    metrics: HealthMetricDto[]
  }>(`/api/v1/family/dashboard?elder_id=${encodeURIComponent(elderId)}`, {
    role: 'family',
    userId: 'family-001'
  })
}

export function fetchFamilyReportApi(elderId: string, period: ApiReportPeriod) {
  return apiRequest<{
    elder_id: string
    period: ApiReportPeriod
    health_score: number
    headline: string
    summary: string
    risk_count: number
    medicine_done_percent: number
    avg_sleep_hours: number
    device_status_label: string
    yuan_interpretation: string
    family_advice: string
    metrics: HealthMetricDto[]
  }>(`/api/v1/family/reports?elder_id=${encodeURIComponent(elderId)}&period=${period}`, {
    role: 'family',
    userId: 'family-001'
  })
}

export function fetchCareTasksApi(elderId: string) {
  return apiRequest<
    Array<{
      id: string
      elder_id: string
      icon: string
      title: string
      description: string
      status: 'done' | 'pending'
      due_label: string
    }>
  >(`/api/v1/family/care/tasks?elder_id=${encodeURIComponent(elderId)}`, {
    role: 'family',
    userId: 'family-001'
  })
}

export function fetchCareStatsApi(elderId: string) {
  return apiRequest<{
    elder_id: string
    done_count: number
    total_count: number
    greeting: string
    album_count: number
  }>(`/api/v1/family/care/stats?elder_id=${encodeURIComponent(elderId)}`, {
    role: 'family',
    userId: 'family-001'
  })
}

export function fetchNotificationRulesApi() {
  return apiRequest<NotificationRuleDto[]>('/api/v1/family/notification-rules', {
    role: 'family',
    userId: 'family-001'
  })
}

export function patchNotificationRulesApi(rules: NotificationRuleDto[]) {
  return apiRequest<NotificationRuleDto[]>('/api/v1/family/notification-rules', {
    method: 'PATCH',
    role: 'family',
    userId: 'family-001',
    body: { rules }
  })
}

type NotificationRuleDto = {
  key: string
  label: string
  description: string
  enabled: boolean
}

export async function loadGuardianDataFromApi(): Promise<{
  elders: BoundElder[]
  summaries: GuardSummary[]
  alerts: AlertEvent[]
}> {
  const [elderDtos, alertDtos] = await Promise.all([fetchBoundEldersApi(), fetchAlertsApi()])
  const alerts = alertDtos.map(mapAlertDto)
  const mockElders = getBoundElders()
  const mockSummaries = getGuardSummaries()

  const elders: BoundElder[] = elderDtos.map((dto) => {
    const template = mockElders.find((m) => m.id === dto.id) ?? mockElders[0]
    const activeCount = alerts.filter((a) => a.elderId === dto.id && a.status !== 'resolved').length
    return mergeBoundElderFromApi(dto, template, activeCount)
  })

  for (const mock of mockElders) {
    if (!elders.some((e) => e.id === mock.id)) {
      elders.push(mockClone(mock))
    }
  }

  const summaries = elders.map((elder) => {
    const template = mockSummaries.find((s) => s.elderId === elder.id) ?? mockSummaries[0]
    const activeCount = alerts.filter((a) => a.elderId === elder.id && a.status !== 'resolved').length
    return mergeGuardSummaryFromApi(elder, template, activeCount)
  })

  return { elders, summaries, alerts }
}

export async function hydrateGuardianData(options: HydrateOptions = {}) {
  return cachedFetch('guardian:all', async () => {
    if (!useApiMode()) {
      return {
        elders: getBoundElders(),
        summaries: getGuardSummaries(),
        alerts: getAlerts()
      }
    }
    return loadGuardianDataFromApi()
  }, options)
}

export async function hydrateCareData(elderId: string, options: HydrateOptions = {}) {
  return cachedFetch(`care:${elderId}`, async () => {
    if (!useApiMode()) {
      return {
        statsList: getCareStatsList(),
        tasks: getCareTasks(elderId),
        photos: getAlbumPhotos()
      }
    }
    const [stats, tasks] = await Promise.all([fetchCareStatsApi(elderId), fetchCareTasksApi(elderId)])
    return {
      statsList: [
        {
          elderId,
          doneCount: stats.done_count,
          totalCount: stats.total_count,
          companionPoints: 281,
          weeklyContacts: 4,
          albumUpdates: stats.album_count,
          headline: stats.greeting,
          suggestion: '小鼋建议保持日常问候，关注老人情绪变化。',
          generatedGreeting: stats.greeting
        }
      ],
      tasks: tasks.map(
        (t): CareTask => ({
          id: t.id,
          elderId: t.elder_id,
          icon: t.icon,
          title: t.title,
          description: t.description,
          status: t.status
        })
      ),
      photos: getAlbumPhotos()
    }
  }, options)
}

export async function hydrateFamilyReport(elderId: string, period: ApiReportPeriod, options: HydrateOptions = {}) {
  return cachedFetch(`report:${elderId}:${period}`, async () => {
    if (!useApiMode()) {
      const report = getFamilyReport(elderId, period)
      const anomalies = getReportAnomalies(elderId)
      return { report, anomalies }
    }
    const dto = await fetchFamilyReportApi(elderId, period)
    const { mapHealthMetricDto } = await import('@/utils/apiMappers')
    const report: HealthReportSummary = {
      elderId: dto.elder_id,
      period: toReportPeriod(dto.period),
      healthScore: dto.health_score,
      headline: dto.headline,
      summary: dto.summary,
      riskCount: dto.risk_count,
      medicineDonePercent: dto.medicine_done_percent,
      avgSleepHours: dto.avg_sleep_hours,
      deviceStatusLabel: dto.device_status_label,
      yuanInterpretation: dto.yuan_interpretation,
      familyAdvice: dto.family_advice,
      metrics: dto.metrics.map(mapHealthMetricDto)
    }
    const anomalies = getReportAnomalies(elderId)
    return { report, anomalies }
  }, options)
}

export async function hydrateNotificationRules(options: HydrateOptions = {}) {
  return cachedFetch('family:notification-rules', async () => {
    if (!useApiMode()) {
      return getNotificationRules()
    }
    const rules = await fetchNotificationRulesApi()
    return rules.map(
      (r): NotificationRule => ({
        key: r.key,
        icon: '🔔',
        title: r.label,
        description: r.description,
        enabled: r.enabled
      })
    )
  }, options)
}
