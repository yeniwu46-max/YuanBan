<template>
  <AppPage :data-source="health.dataSource">
    <AppHeader title="健康总览" back="/pages/home/index" compact />
    <view class="section">
      <AquaHero :title="health.summaryTitle" :state="listMetrics.some(m => m.status !== 'normal') ? 'reminder' : 'encouraging'">
        <button class="health-report-link" @click="go('/pkg-elder-detail/health-report/index')">查看报告<AppIcon name="chevron" :size="18" /></button>
      </AquaHero>
    </view>
    <view class="section-title">
      <view class="h2">身体指标</view>
      <button class="link" @click="health.playVoiceSummary(health.summaryTitle)">语音播报</button>
    </view>
    <view v-if="health.voiceMessage" class="section"><view class="card feedback" role="status">{{ health.voiceMessage }}</view></view>
    <view v-if="health.loading" class="section"><view class="feedback-panel" role="status">正在更新…</view></view>
    <view v-else-if="health.error" class="section"><view class="feedback-panel" role="alert">{{ health.error }}<button class="link" @click="health.hydrate(elderId, { force:true })">重试</button></view></view>
    <view v-else-if="!listMetrics.length" class="section"><view class="feedback-panel">暂无健康数据</view></view>
    <view v-else class="list">
      <ListItem v-for="item in listMetrics" :key="item.key" :icon="iconMap[item.key]" :title="item.label"
        :tag="isMetricUsable(item) ? tagText(item.status) : '未获取'" :tag-tone="!isMetricUsable(item) ? 'gray' : item.status === 'warning' ? 'warm' : item.status === 'danger' ? 'red' : 'normal'"
        :right-text="isMetricUsable(item) ? `${item.value}${item.unit || ''}` : '—'" @click="openMetric(item.key)" />
    </view>
  </AppPage>
</template>
<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { computed } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import AquaHero from '@/components/AquaHero.vue'
import ListItem from '@/components/ListItem.vue'
import { useElderContext } from '@/composables/useElderContext'
import { refreshInBackground } from '@/services/prefetch'
import { useHealthStore } from '@/stores/health'
import { goDetail } from '@/utils/navigate'
import type { HealthMetric } from '@/types/elder'
import { isMetricUsable } from '@/utils/trends'

const health = useHealthStore()
const { elderId } = useElderContext()

onShow(() => {
  refreshInBackground(() => health.hydrate(elderId.value, { force: true }))
})

const listMetrics = computed<HealthMetric[]>(() =>
  ['heartRate', 'breathRate', 'bloodPressure', 'sleep', 'fallRisk']
    .map((key) => health.metricByKey(key))
    .filter((item): item is HealthMetric => Boolean(item))
)
const iconMap: Record<string, string> = {
  heartRate: '心',
  breathRate: '息',
  bloodPressure: '压',
  sleep: '眠',
  fallRisk: '稳'
}

function tagText(status: string) {
  if (status === 'danger') return '需处理'
  return status === 'warning' ? '需关注' : '正常'
}

function openMetric(key: HealthMetric['key']) {
  if (key === 'bloodPressure') {
    go('/pkg-elder-detail/bp/index')
    return
  }
  go(`/pkg-elder-detail/health-metric/index?key=${key}`)
}

function go(url: string) {
  goDetail(url)
}
</script>

<style scoped>
.health-report-link { display:inline-flex; align-items:center; gap:8px; min-height:48px; padding:4px 14px; border-radius:24px; background:white; color:var(--primary); font-size:18px; }
.feedback { padding:16px; }
</style>
