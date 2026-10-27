<script setup lang="ts">
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AppHeader from '@/components/AppHeader.vue'
import HealthMetricCard from '@/components/HealthMetricCard.vue'
import TrendPanel from '@/components/TrendPanel.vue'
// #ifdef H5
import Tabs from '@/components/ui/Tabs.vue'
// #endif
import { useHealthStore } from '@/stores/health'
import { useElderContext } from '@/composables/useElderContext'
import { useApiMode } from '@/config/apiMode'
import { goRoute } from '@/utils/navigate'
import type { ApiReportPeriod } from '@/types/family'
const health = useHealthStore(),
  { elderId } = useElderContext()
onShow(() => { void health.hydrate(elderId.value) })
const period = computed<string>({
  get: () => health.reportTab,
  set: (v) => health.setReportTab(v as ApiReportPeriod),
})
const days = computed(() => ({ day: 1, week: 7, month: 30 })[health.reportTab])
const options = [
  { label: '日报', value: 'day' },
  { label: '周报', value: 'week' },
  { label: '月报', value: 'month' },
]
const metrics = computed(() =>
  health.metrics.filter((m) =>
    ['heartRate', 'bloodPressure', 'sleep', 'breathRate'].includes(m.key),
  ),
)
</script>
<template>
  <AppPage :data-source="health.dataSource">
    <AppHeader title="健康报告" back="/pages/health/index" />
    <view class="section">
      <!-- #ifdef H5 -->
      <Tabs v-model="period" :options="options" label="报告时间范围">
        <view class="data-source">
          最近 {{ days }} 天
        </view>
      </Tabs>
      <!-- #endif -->
      <!-- #ifndef H5 -->
      <view class="tabbar">
        <button v-for="o in options" :key="o.value" @click="period = o.value">
          {{ o.label }}
        </button>
      </view>
      <!-- #endif -->
    </view>
    <view class="section-title"><view class="h2">最新健康摘要</view></view>
    <view class="section">
      <view class="grid2">
        <HealthMetricCard
          v-for="metric in metrics"
          :key="metric.key"
          :metric="metric"
          :icon="metric.key"
          @click="goRoute('/pkg-elder-detail/health-metric/index?key=' + metric.key)"
        />
      </view>
    </view>
    <view class="section">
      <TrendPanel :elder-id="elderId" metric="bloodPressure" :days="days" />
    </view>
    <view class="section"><TrendPanel :elder-id="elderId" metric="sleep" :days="days" /></view>
  </AppPage>
</template>
