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
import { mockClone } from '@/services/mockClone'
import type { AlertStatus, ApiReportPeriod, ReportPeriod } from '@/types/family'

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
