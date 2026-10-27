<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import AppHeader from '@/components/AppHeader.vue'
import TrendPanel from '@/components/TrendPanel.vue'
import { useElderContext } from '@/composables/useElderContext'
import { useHealthStore } from '@/stores/health'
import { metricPresentation } from '@/utils/trends'
import { useApiMode } from '@/config/apiMode'
import type { HealthMetric } from '@/types/elder'
const health = useHealthStore(),
  { elderId } = useElderContext()
const activeKey = ref<HealthMetric['key']>('heartRate')
const metric = computed(() => health.metricByKey(activeKey.value))
const detail = computed(() => health.metricDetail(activeKey.value))
onLoad((query) => {
  const key = query?.key as HealthMetric['key']
  if (key && ['heartRate', 'breathRate', 'bloodPressure', 'sleep', 'fallRisk', 'medicine'].includes(key)) activeKey.value = key
})
onShow(() => { void health.hydrate(elderId.value) })
</script>
<template>
  <AppPage :data-source="health.dataSource">
    <AppHeader
      :title="(metric?.label || '健康') + '详情'"
      back="/pages/health/index"
    />
    <view class="section">
      <view class="hero green">
        <view class="row">
          <AppIcon :name="activeKey" />
          <text>最新{{ metric?.label }}摘要</text>
        </view>
        <view class="metric-value">
          {{ metric?.value ?? '—' }}
          <text>{{ metric?.unit }}</text>
        </view>
        <view class="desc">{{ metric?.description || '暂无最新摘要' }}</view>
      </view>
    </view>
    <view v-if="metricPresentation[activeKey]" class="section">
      <TrendPanel :elder-id="elderId" :metric="activeKey" :days="7" />
    </view>
    <view v-else class="section">
      <view class="feedback-panel">
        <view class="h2">状态记录</view>
        <view v-if="useApiMode()" class="desc">该指标暂不提供数值趋势，请查看最新状态。</view>
        <template v-else>
          <view class="data-source">来源：示例</view>
          <view v-for="record in detail?.records" :key="record.id" class="record">
            <text>{{ record.time }}</text>
            <text>{{ record.value }}</text>
          </view>
        </template>
      </view>
    </view>
  </AppPage>
</template>
<style scoped>
.metric-value {
  font-size: 44px;
  margin: 18px 0;
  letter-spacing: -0.04em;
}
.metric-value text {
  font-size: 16px;
  color: var(--hero-ink);
  letter-spacing: 0;
}
.record {
  padding: 14px 0;
  border-bottom: 1px solid var(--line);
  display: flex;
  gap: 12px;
  justify-content: space-between;
  flex-wrap: wrap;
}
</style>
