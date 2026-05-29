import { defineStore } from 'pinia'
import { healthReportSummaries, reportAnomalies } from '@/mock/family'
import { hydrateFamilyReport } from '@/services/familyService'
import { mockClone } from '@/services/mockClone'
import type { ApiReportPeriod } from '@/types/family'
import type { HydrateOptions } from '@/services/requestCache'

export const useFamilyReportStore = defineStore('familyReport', {
  state: () => ({
    reports: mockClone(healthReportSummaries),
    anomalies: mockClone(reportAnomalies),
    loading: false
  }),
  getters: {
    reportByElder: (state) => (elderId: string) => state.reports.find((item) => item.elderId === elderId),
    anomaliesByElder: (state) => (elderId: string) => state.anomalies.filter((item) => item.elderId === elderId)
  },
  actions: {
    async hydrate(elderId: string, period: ApiReportPeriod = 'week', options: HydrateOptions = {}) {
      this.loading = true
      try {
        const data = await hydrateFamilyReport(elderId, period, options)
        if (data.report) {
          const others = this.reports.filter((r) => !(r.elderId === elderId && r.period === data.report?.period))
          this.reports = [...others, data.report]
        }
        this.anomalies = data.anomalies
      } catch {
        uni.showToast({ title: '报告加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    }
  }
})
