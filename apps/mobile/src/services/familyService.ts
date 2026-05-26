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
import type { ElderDto } from '@/services/elderService'
import { mockClone } from '@/services/mockClone'
import {
  mapAlertDto,
  mergeBoundElderFromApi,
  mergeGuardSummaryFromApi
} from '@/utils/apiMappers'
import type { AlertStatus, ApiReportPeriod, BoundElder, GuardSummary, ReportPeriod } from '@/types/family'

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

export function updateAlertStatus(alertId: string, status: AlertStatus) {
  const target = alertEvents.find((item) => item.id === alertId)
  if (target) {
    target.status = status
  }
  return mockClone(target)
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

export async function loadGuardianDataFromApi(): Promise<{
  elders: BoundElder[]
  summaries: GuardSummary[]
}> {
  const [elderDtos, alertDtos] = await Promise.all([fetchBoundEldersApi(), fetchAlertsApi()])
  const alerts = alertDtos.map(mapAlertDto)
  const mockElders = getBoundElders()
  const mockSummaries = getGuardSummaries()

  const elders: BoundElder[] = elderDtos.map((dto) => {
    const template = mockElders.find((m) => m.id === dto.id) ?? mockElders[0]
    const activeCount = alerts.filter(
      (a) => a.elderId === dto.id && a.status !== 'resolved'
    ).length
    return mergeBoundElderFromApi(dto, template, activeCount)
  })

  for (const mock of mockElders) {
    if (!elders.some((e) => e.id === mock.id)) {
      elders.push(mockClone(mock))
    }
  }

  const summaries = elders.map((elder) => {
    const template = mockSummaries.find((s) => s.elderId === elder.id) ?? mockSummaries[0]
    const activeCount = alerts.filter(
      (a) => a.elderId === elder.id && a.status !== 'resolved'
    ).length
    return mergeGuardSummaryFromApi(elder, template, activeCount)
  })

  return { elders, summaries }
}

export async function hydrateGuardianData() {
  if (!useApiMode()) {
    return { elders: getBoundElders(), summaries: getGuardSummaries() }
  }
  return loadGuardianDataFromApi()
}
