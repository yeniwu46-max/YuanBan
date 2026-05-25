import { useAlertStore } from '@/stores/alert'
import { useFamilyReportStore } from '@/stores/familyReport'
import { useGuardianStore } from '@/stores/guardian'
import { syncAnomaliesFromAlerts, syncRiskCountsFromAlerts } from '@/utils/familyDerivedState'

export function syncFamilyDerivedState() {
  const alert = useAlertStore()
  const guardian = useGuardianStore()
  const report = useFamilyReportStore()

  syncRiskCountsFromAlerts(guardian.elders, guardian.summaries, report.reports, alert.alerts)
  syncAnomaliesFromAlerts(report.anomalies, alert.alerts)
}

