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
import { getApiAuthOptions } from '@/utils/authContext'
import { apiRequest } from '@/services/apiClient'
import { cachedFetch, type HydrateOptions } from '@/services/requestCache'
import { mockClone } from '@/services/mockClone'
import {
  mapElderDtoToProfile,
  mapHealthMetricDto,
  mapAlertDto,
  elderDtoToBoundElder,
  elderDtoToGuardSummary
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
  recommended_actions?: Array<{
    id: string
    icon: string
    title: string
    description: string
    route?: string | null
  }>
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
  return apiRequest<AlertDto[]>(`/api/v1/alerts${q}`, getApiAuthOptions())
}

export function fetchAlertByIdApi(alertId: string) {
  return apiRequest<AlertDto>(`/api/v1/alerts/${alertId}`, getApiAuthOptions())
}

export function patchAlertApi(alertId: string, status: AlertStatus, statusLabel?: string) {
  return apiRequest<AlertDto>(`/api/v1/alerts/${alertId}`, {
    method: 'PATCH',
    body: { status, status_label: statusLabel },
    ...getApiAuthOptions()
  })
}

export function fetchBoundEldersApi() {
  return apiRequest<ElderDto[]>('/api/v1/elders', getApiAuthOptions())
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
  }>(`/api/v1/family/dashboard?elder_id=${encodeURIComponent(elderId)}`, getApiAuthOptions())
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
  }>(`/api/v1/family/reports?elder_id=${encodeURIComponent(elderId)}&period=${period}`, getApiAuthOptions())
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
  >(`/api/v1/family/care/tasks?elder_id=${encodeURIComponent(elderId)}`, getApiAuthOptions())
}

export function patchCareTaskApi(taskId: string, status: 'done' | 'pending') {
  return apiRequest<{
    id: string
    elder_id: string
    icon: string
    title: string
    description: string
    status: 'done' | 'pending'
    due_label: string
  }>(`/api/v1/family/care/tasks/${taskId}`, {
    method: 'PATCH',
    body: { status },
    ...getApiAuthOptions()
  })
}

export function fetchCareStatsApi(elderId: string) {
  return apiRequest<{
    elder_id: string
    done_count: number
    total_count: number
    greeting: string
    album_count: number
  }>(`/api/v1/family/care/stats?elder_id=${encodeURIComponent(elderId)}`, getApiAuthOptions())
}

export function fetchNotificationRulesApi() {
  return apiRequest<NotificationRuleDto[]>('/api/v1/family/notification-rules', getApiAuthOptions())
}

export function patchNotificationRulesApi(rules: NotificationRuleDto[]) {
  return apiRequest<NotificationRuleDto[]>('/api/v1/family/notification-rules', {
    method: 'PATCH',
    body: { rules },
    ...getApiAuthOptions()
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

  const dashboardByElder = await Promise.all(
    elderDtos.map(async (dto) => {
      try {
        return await fetchFamilyDashboardApi(dto.id)
      } catch {
        return null
      }
    })
  )

  const elders: BoundElder[] = elderDtos.map((dto, index) => {
    const dash = dashboardByElder[index]
    const activeCount = dash?.active_alert_count ?? alerts.filter((a) => a.elderId === dto.id && a.status !== 'resolved').length
    const bound = elderDtoToBoundElder(dto, activeCount)
    if (dash) {
      bound.guardScore = dash.guard_score
      bound.healthScore = dash.health_score
      bound.medicineDonePercent = dash.medicine_done_percent
      bound.safetyHeadline = dash.safety_headline
    }
    return bound
  })

  const summaries = elders.map((elder, index) => {
    const dash = dashboardByElder[index]
    const summary = elderDtoToGuardSummary(elder, elder.riskCount)
    if (dash) {
      summary.companionSuggestion = dash.companion_suggestion
      summary.safetyHeadline = dash.safety_headline
    }
    return summary
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
      photos: []
    }
  }, options)
}

export async function fetchRecommendedActionsForAlert(alertId: string) {
  if (!useApiMode()) {
    return getRecommendedActions()
  }
  const dto = await fetchAlertByIdApi(alertId)
  return (dto.recommended_actions ?? []).map((item) => ({
    id: item.id,
    icon: item.icon,
    title: item.title,
    description: item.description,
    route: item.route ?? undefined
  }))
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
    const anomalies =
      dto.risk_count > 0
        ? [
            {
              id: `risk-${elderId}`,
              elderId,
              icon: '⚠',
              title: '体征需关注',
              description: `检测到 ${dto.risk_count} 项指标异常`,
              tag: '需关注',
              tagTone: 'warm' as const
            }
          ]
        : []
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
