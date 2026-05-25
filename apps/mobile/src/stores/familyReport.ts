import { defineStore } from 'pinia'
import { getFamilyReports, getReportAnomalies } from '@/services/familyService'

export const useFamilyReportStore = defineStore('familyReport', {
  state: () => ({
    reports: getFamilyReports(),
    anomalies: getReportAnomalies()
  }),
  getters: {
    reportByElder: (state) => (elderId: string) => state.reports.find((item) => item.elderId === elderId),
    anomaliesByElder: (state) => (elderId: string) => state.anomalies.filter((item) => item.elderId === elderId)
  }
})
