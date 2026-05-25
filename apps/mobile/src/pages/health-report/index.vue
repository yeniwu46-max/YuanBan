<template>
  <view class="app-page">
    <AppHeader label="我的身体" title="健康报告" back="/pages/health/index" compact />
    <view class="scroll-section">
      <view class="tabbar">
        <button class="tabbar-btn" :class="{ active: health.reportTab === 'day' }" @click="health.setReportTab('day')">日报</button>
        <button class="tabbar-btn" :class="{ active: health.reportTab === 'week' }" @click="health.setReportTab('week')">周报</button>
        <button class="tabbar-btn" :class="{ active: health.reportTab === 'month' }" @click="health.setReportTab('month')">月报</button>
      </view>
      <view class="hero green">
        <view class="between row-top">
          <view>
            <view class="pill">{{ periodLabel }}整体平稳</view>
            <view class="report-copy">小鼋为您整理好了这段时间的身体情况。</view>
            <view class="muted report-desc">血压有轻微波动，睡眠和呼吸整体良好。</view>
          </view>
          <view class="score">
            <view class="score-num">{{ score }}</view>
            <view class="score-label">健康分</view>
          </view>
        </view>
        <view class="grid3 report-stats">
          <view class="card stat-card"><view class="muted">正常天数</view><view class="h2">{{ normalDays }}</view></view>
          <view class="card stat-card"><view class="muted">提醒次数</view><view class="h2 warn">3 次</view></view>
          <view class="card stat-card"><view class="muted">运动达标</view><view class="h2">4 天</view></view>
        </view>
      </view>
      <view class="hero warm summary">
        <view class="row row-top">
          <YuanMascot size="small" />
          <view>
            <view class="h2 summary-title">小鼋总结</view>
            <view class="muted summary-copy">您这段时间状态不错。血压偶尔略高，注意少盐、慢走，睡前可以再测一次。</view>
          </view>
        </view>
      </view>
      <view class="section-title flush-title">
        <view class="h2">核心指标</view>
        <button class="link" @click="health.playVoiceSummary('正在播报健康报告')">语音播报</button>
      </view>
      <view v-if="health.voiceMessage" class="card feedback">{{ health.voiceMessage }}</view>
      <view class="grid2">
        <HealthMetricCard :metric="metric('heartRate')" icon="心" @click="goMetric('heartRate')" />
        <HealthMetricCard :metric="metric('breathRate')" icon="息" @click="goMetric('breathRate')" />
        <HealthMetricCard :metric="metric('bloodPressure')" icon="压" @click="go('/pages/bp/index')" />
        <HealthMetricCard :metric="metric('sleep')" icon="眠" @click="goMetric('sleep')" />
      </view>
      <view class="section-title flush-title">
        <view class="h2">趋势</view>
        <button class="link" @click="go('/pages/bp/index')">详情 ›</button>
      </view>
      <view class="card chart-card">
        <view class="trend-title">血压与睡眠变化</view>
        <view class="muted trend-copy">今天血压略高，睡眠保持稳定</view>
        <view class="chart">
          <view class="line orange"></view>
          <view class="line greenline"></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import HealthMetricCard from '@/components/HealthMetricCard.vue'
import YuanMascot from '@/components/YuanMascot.vue'
import { useHealthStore } from '@/stores/health'
import { goDetail } from '@/utils/navigate'
import type { HealthMetric } from '@/types/elder'

const health = useHealthStore()
const periodLabel = computed(() => ({ day: '今日', week: '本周', month: '本月' }[health.reportTab]))
const score = computed(() => ({ day: 92, week: 88, month: 90 }[health.reportTab]))
const normalDays = computed(() => ({ day: '1 天', week: '5 天', month: '24 天' }[health.reportTab]))

function metric(key: string): HealthMetric {
  return health.metricByKey(key) ?? health.metrics[0]
}

function goMetric(key: HealthMetric['key']) {
  go(`/pages/health-metric/index?key=${key}`)
}

function go(url: string) {
  goDetail(url)
}
</script>

<style scoped>
.report-copy {
  margin-top: 15px;
  font-size: 24px;
  line-height: 1.35;
  font-weight: 900;
}

.report-desc {
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
  font-weight: 900;
  color: #7a6f5d;
}

.report-stats {
  margin-top: 16px;
}

.stat-card {
  padding: 12px;
  text-align: center;
}

.warn {
  color: #c9822c;
}

.summary {
  margin-top: 18px;
}

.summary-title {
  font-size: 18px;
}

.summary-copy {
  margin-top: 6px;
  line-height: 1.5;
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

.chart-card {
  padding: 16px;
}

.trend-title {
  font-size: 18px;
  font-weight: 900;
}

.trend-copy {
  font-size: 13px;
  margin-top: 4px;
}

.chart {
  position: relative;
  height: 146px;
  margin-top: 8px;
}

.line {
  position: absolute;
  left: 10px;
  right: 10px;
  height: 4px;
  border-radius: 999px;
}

.orange {
  top: 58px;
  background: #c9822c;
  transform: skewY(-8deg);
}

.greenline {
  top: 92px;
  background: #7ab66b;
  transform: skewY(-3deg);
}
</style>
