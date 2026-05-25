import type { AlertEvent, BoundElder, GuardSummary, HealthReportSummary, ReportAnomaly } from '@/types/family'

export function countOpenAlerts(alerts: AlertEvent[], elderId: string) {
  return alerts.filter((item) => item.elderId === elderId && item.status !== 'resolved').length
}

export function syncRiskCountsFromAlerts(
  elders: BoundElder[],
  summaries: GuardSummary[],
  reports: HealthReportSummary[],
  alerts: AlertEvent[]
) {
  for (const elder of elders) {
    const openCount = countOpenAlerts(alerts, elder.id)
    elder.riskCount = openCount
    const summary = summaries.find((item) => item.elderId === elder.id)
    if (summary) {
      summary.riskCount = openCount
    }
    const report = reports.find((item) => item.elderId === elder.id)
    if (report) {
      report.riskCount = openCount
    }
  }
}

export function syncAnomaliesFromAlerts(anomalies: ReportAnomaly[], alerts: AlertEvent[]) {
  for (const anomaly of anomalies) {
    if (!anomaly.alertId) continue
    const alert = alerts.find((item) => item.id === anomaly.alertId)
    if (!alert) continue
    anomaly.tag = alert.tag
    anomaly.tagTone = alert.tagTone
  }
}

