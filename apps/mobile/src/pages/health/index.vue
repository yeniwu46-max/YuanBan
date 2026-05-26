<template>
  <view class="app-page">
    <AppHeader label="我的身体" title="健康总览" back="/pages/home/index" compact />
    <view class="section">
      <view class="hero green">
        <view class="between row-top">
          <view class="hero-main">
            <view class="pill">今日状态良好</view>
            <view class="h2 summary-title">身体指标平稳</view>
            <view class="muted summary-copy">小鼋已为您整理今天的健康情况，有一项服药提醒待完成。</view>
          </view>
          <view class="score">
            <view class="score-num">92</view>
            <view class="score-label">健康分</view>
          </view>
        </view>
        <button class="card report-link" @click="go('/pages/health-report/index')">
          <text>今日报告已生成</text>
          <text class="chev">›</text>
        </button>
      </view>
    </view>
    <view class="section-title">
      <view class="h2">身体指标</view>
      <button class="link" @click="health.playVoiceSummary('正在播报：今天心率、呼吸和睡眠都比较平稳。')">语音播报</button>
    </view>
    <view v-if="health.voiceMessage" class="section">
      <view class="card feedback">{{ health.voiceMessage }}</view>
    </view>
    <view class="list">
      <ListItem
        v-for="item in listMetrics"
        :key="item.key"
        :icon="iconMap[item.key]"
        :title="item.label"
        :desc="item.description"
        :tag="tagText(item.status)"
        :tag-tone="item.status === 'warning' ? 'warm' : item.status === 'danger' ? 'red' : 'normal'"
        :right-text="`${item.value}${item.unit ? item.unit : ''}`"
        @click="openMetric(item.key)"
      />
    </view>
    <BottomNav active="health" />
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { computed } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import BottomNav from '@/components/BottomNav.vue'
import ListItem from '@/components/ListItem.vue'
import { useHealthStore } from '@/stores/health'
import { goDetail } from '@/utils/navigate'
import type { HealthMetric } from '@/types/elder'

const health = useHealthStore()

onShow(() => {
  void health.hydrate()
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
    go('/pages/bp/index')
    return
  }
  go(`/pages/health-metric/index?key=${key}`)
}

function go(url: string) {
  goDetail(url)
}
</script>

<style scoped>
.hero-main {
  flex: 1;
}

.summary-title {
  font-size: 24px;
  margin-top: 16px;
}

.summary-copy {
  margin-top: 8px;
  line-height: 1.5;
}

.score {
  width: 92px;
  height: 92px;
  border-radius: 50%;
  background: #fffdf7;
  border: 8px solid #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.score-num {
  font-size: 28px;
  color: #315943;
  font-weight: 900;
}

.score-label {
  font-size: 12px;
  color: #7a6f5d;
  font-weight: 900;
}

.report-link {
  margin-top: 18px;
  min-height: 54px;
  border-radius: 18px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  color: #315943;
  font-size: 16px;
  font-weight: 900;
}

.feedback {
  padding: 12px 14px;
  color: #315943;
  font-weight: 900;
}
</style>
