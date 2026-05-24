import { computed } from 'vue'
import { useAlertStore } from '@/stores/alert'
import { useCareStore } from '@/stores/care'
import { useFamilyReportStore } from '@/stores/familyReport'
import { useGuardianStore } from '@/stores/guardian'

export function useFamilyElderContext() {
  const guardian = useGuardianStore()
  const alertStore = useAlertStore()
  const careStore = useCareStore()
  const reportStore = useFamilyReportStore()

  const elder = computed(() => guardian.currentElder)
  const summary = computed(() => guardian.currentSummary)
  const switching = computed(() => guardian.switching)
  const elderId = computed(() => guardian.currentElderId)

  const elderAlerts = computed(() => alertStore.sortedAlertsByElder(guardian.currentElderId))
  const report = computed(() => reportStore.reportByElder(guardian.currentElderId))
  const careStats = computed(() => careStore.statsByElder(guardian.currentElderId))
  const careTasks = computed(() => careStore.tasksByElder(guardian.currentElderId))
  const reportAnomalies = computed(() => reportStore.anomaliesByElder(guardian.currentElderId))

  return {
    guardian,
    alertStore,
    careStore,
    reportStore,
    elder,
    summary,
    switching,
    elderId,
    elderAlerts,
    report,
    careStats,
    careTasks,
    reportAnomalies
  }
}
