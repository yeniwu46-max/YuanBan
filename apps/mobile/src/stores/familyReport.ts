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
    loading: false,
    pending: {} as Record<string, boolean>,
    errors: {} as Record<string, string>
  }),
  getters: {
    reportByElder: (state) => (elderId: string, period: ApiReportPeriod = 'week') => state.reports.find((item) => item.elderId === elderId && item.period === ({day:'daily',week:'weekly',month:'monthly'}[period])),
    anomaliesByElder: (state) => (elderId: string) => state.anomalies.filter((item) => item.elderId === elderId)
  },
  actions: {
    async hydrate(elderId: string, period: ApiReportPeriod = 'week', options: HydrateOptions = {}) {
      const key = elderId + ':' + period
      if (this.pending[key]) return
      this.pending[key] = true
      this.errors[key] = ''
      this.loading = true
      try {
        const data = await hydrateFamilyReport(elderId, period, options)
        if (data.report) {
          const others = this.reports.filter((r) => !(r.elderId === elderId && r.period === data.report?.period))
          this.reports = [...others, data.report]
        }
        this.anomalies = [...this.anomalies.filter(item => item.elderId !== elderId), ...data.anomalies]
      } catch {
        this.errors[key] = '报告加载失败，请检查网络后重试。'
        uni.showToast({ title: '报告加载失败', icon: 'none' })
      } finally {
        this.pending[key] = false
        this.loading = false
      }
    }
  }
})
