<template>
  <view class="app-page">
    <AppHeader label="我的身体" :title="detail.title" back="/pages/health/index" compact />
    <view class="scroll-section">
      <view class="hero" :class="metric?.status === 'warning' ? 'warm' : metric?.status === 'danger' ? 'red' : 'green'">
        <view class="between row-top">
          <view>
            <view class="pill">{{ statusText }}</view>
            <view class="metric-value">
              {{ metric?.value }}
              <text v-if="metric?.unit" class="metric-unit">{{ metric.unit }}</text>
            </view>
            <view class="muted metric-copy">{{ detail.headline }}</view>
          </view>
          <view class="iconbox metric-icon">{{ detail.icon }}</view>
        </view>
      </view>
      <view class="hero warm tip">
        <view class="h2 tip-title">小鼋建议</view>
        <view class="muted tip-copy">{{ detail.advice }}</view>
      </view>
      <view class="section-title flush-title">
        <view class="h2">{{ detail.trendLabel }}</view>
        <button class="link" @click="health.playVoiceSummary(`正在播报${detail.title}`)">语音播报</button>
      </view>
      <view v-if="health.voiceMessage" class="card feedback">{{ health.voiceMessage }}</view>
      <view class="list flush">
        <ListItem
          v-for="record in detail.records"
          :key="record.id"
          icon="记"
          :title="record.time"
          :desc="record.value"
          :tag="record.status === 'warning' ? '关注' : record.status === 'danger' ? '处理' : '正常'"
          :tag-tone="record.status === 'warning' ? 'warm' : record.status === 'danger' ? 'red' : 'normal'"
          :chev="false"
        />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import AppHeader from '@/components/AppHeader.vue'
import ListItem from '@/components/ListItem.vue'
import { useHealthStore } from '@/stores/health'
import type { HealthMetric } from '@/types/elder'

const health = useHealthStore()
const activeKey = ref<HealthMetric['key']>('heartRate')
const metric = computed(() => health.metricByKey(activeKey.value))
const detail = computed(() => health.metricDetail(activeKey.value) ?? health.metricDetail('heartRate')!)
const statusText = computed(() => (metric.value?.status === 'warning' ? '需要关注' : metric.value?.status === 'danger' ? '需要处理' : '状态正常'))

onLoad((query) => {
  const key = query?.key as HealthMetric['key'] | undefined
  if (key && health.metricByKey(key)) {
    activeKey.value = key
  }
})
</script>

<style scoped>
.metric-value {
  margin-top: 16px;
  font-size: 44px;
  font-weight: 900;
  color: #243a31;
}

.metric-unit {
  font-size: 14px;
  color: #7a6f5d;
}

.metric-copy {
  margin-top: 8px;
  line-height: 1.5;
}

.metric-icon {
  width: 84px;
  height: 84px;
  border-radius: 28px;
  font-size: 34px;
  font-weight: 900;
}

.tip {
  margin-top: 18px;
}

.tip-title {
  font-size: 19px;
}

.tip-copy {
  margin-top: 8px;
  line-height: 1.55;
}

.flush-title {
  padding: 0;
}

.feedback {
  padding: 12px 14px;
  margin-bottom: 12px;
  color: #315943;
  font-weight: 900;
}
</style>
