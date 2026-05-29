<template>
  <view class="app-page family-page">
    <FamilyPageHeader label="子女端 · 报告中心" switchable />

    <FamilyPageSkeleton v-if="switching" />

    <template v-else-if="report">
      <view class="section">
        <view class="tabbar">
          <button class="tabbar-btn" :class="{ active: health.reportTab === 'day' }" @click="health.setReportTab('day')">日报</button>
          <button class="tabbar-btn" :class="{ active: health.reportTab === 'week' }" @click="health.setReportTab('week')">周报</button>
          <button class="tabbar-btn" :class="{ active: health.reportTab === 'month' }" @click="health.setReportTab('month')">月报</button>
        </view>
      </view>

      <view class="section">
        <view class="hero green">
          <view class="between row-top">
            <view class="main">
              <view class="pill">{{ periodPill }}</view>
              <view class="hero-title">{{ report.headline }}</view>
              <view class="muted hero-desc">{{ report.summary }}</view>
            </view>
            <view class="score-ring">
              <text class="score-num">{{ report.healthScore }}</text>
              <text class="score-label">健康分</text>
            </view>
          </view>
          <view class="grid4 mini-stats">
            <view class="card stat-card">
              <text class="muted">风险</text>
              <text class="stat-num warm">{{ report.riskCount }}次</text>
            </view>
            <view class="card stat-card">
              <text class="muted">服药</text>
              <text class="stat-num">{{ report.medicineDonePercent }}%</text>
            </view>
            <view class="card stat-card">
              <text class="muted">睡眠</text>
              <text class="stat-num">{{ report.avgSleepHours }}h</text>
            </view>
            <view class="card stat-card">
              <text class="muted">设备</text>
              <text class="stat-num small">{{ report.deviceStatusLabel }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="hero warm summary-card">
          <view class="row row-top">
            <view class="iconbox warm mascot-box">
              <YuanMascot size="small" />
            </view>
            <view>
              <view class="summary-title">小鼋{{ periodLabel }}解读 🔊</view>
              <view class="muted summary-copy">{{ report.yuanInterpretation }}</view>
            </view>
          </view>
        </view>
      </view>

      <view class="section-title">
        <view class="h2">核心指标</view>
        <button class="link" @click="toast('详细报告')">详细报告 ›</button>
      </view>
      <view class="section compact-top">
        <view class="grid2">
          <HealthMetricCard
            v-for="item in report.metrics"
            :key="item.key"
            :metric="item"
            :icon="metricIcon(item.key)"
          />
        </view>
      </view>

      <view class="section-title">
        <view class="h2">趋势分析</view>
        <text class="muted trend-label">近 7 天</text>
      </view>
      <view class="section compact-top">
        <view class="card chart-card">
          <view class="trend-title">血压与睡眠变化</view>
          <view class="muted trend-copy">{{ trendCopy }}</view>
          <view class="chart">
            <view class="line orange"></view>
            <view class="line greenline"></view>
          </view>
        </view>
      </view>

      <view class="section-title">
        <view class="h2">异常记录汇总</view>
        <text class="muted trend-label">本周 {{ reportAnomalies.length }} 条</text>
      </view>
      <view class="list flush section-gap">
        <AlertCard
          v-for="item in reportAnomalies"
          :key="item.id"
          :alert="anomalyAsAlert(item)"
          @click="openAnomaly(item)"
        />
        <FamilyEmptyState
          v-if="!reportAnomalies.length"
          icon="🌿"
          title="本周暂无异常"
          description="老人整体状态平稳，可继续保持日常关怀节奏。"
        />
      </view>

      <view class="section">
        <view class="hero green advice-card">
          <view class="row row-top">
            <view class="iconbox">💬</view>
            <view>
              <view class="advice-title">给家人的建议</view>
              <view class="muted advice-copy">{{ report.familyAdvice }}</view>
            </view>
          </view>
          <view class="grid2 action-row">
            <BigButton tone="green" @click="openContact">📹 发起视频</BigButton>
            <BigButton tone="white" @click="openContact">☎ 电话关怀</BigButton>
          </view>
        </view>
      </view>
    </template>

    <view v-else class="section">
      <FamilyEmptyState
        icon="📋"
        title="暂无健康报告"
        description="该老人还没有可查看的报告，绑定设备后会自动生成。"
        action-label="返回守护首页"
        @action="goHome('/pages/family/guardian/index')"
      />
    </view></view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { computed } from 'vue'
import BigButton from '@/components/BigButton.vue'
import HealthMetricCard from '@/components/HealthMetricCard.vue'
import YuanMascot from '@/components/YuanMascot.vue'
import AlertCard from '@/components/family/AlertCard.vue'
import FamilyEmptyState from '@/components/family/FamilyEmptyState.vue'
import FamilyPageHeader from '@/components/family/FamilyPageHeader.vue'
import FamilyPageSkeleton from '@/components/family/FamilyPageSkeleton.vue'
import { useFamilyElderContext } from '@/composables/useFamilyElderContext'
import { useHealthStore } from '@/stores/health'
import { goDetail, goHome, goMainTab } from '@/utils/navigate'
import type { AlertEvent, ReportAnomaly } from '@/types/family'

const health = useHealthStore()
const { switching, report, reportAnomalies, alertStore, elderId, reportStore } = useFamilyElderContext()

onShow(() => {
  void reportStore.hydrate(elderId.value, health.reportTab, { force: false })
})

const periodPill = computed(() => {
  if (health.reportTab === 'day') return '🛡️ 今日整体平稳'
  if (health.reportTab === 'month') return '🛡️ 本月整体平稳'
  return '🛡️ 本周整体平稳'
})

const periodLabel = computed(() => {
  if (health.reportTab === 'day') return '今日'
  if (health.reportTab === 'month') return '本月'
  return '本周'
})

const trendCopy = computed(() =>
  report.value?.deviceStatusLabel === '离线'
    ? '设备离线，趋势数据暂不可用'
    : '今天血压略高，睡眠稳定提升'
)

function metricIcon(key: string) {
  const map: Record<string, string> = {
    heartRate: '❤️',
    breathRate: '🌬️',
    bloodPressure: '💧',
    sleep: '🌙'
  }
  return map[key] ?? '📊'
}

function anomalyAsAlert(item: ReportAnomaly): AlertEvent {
  return {
    id: item.id,
    elderId: item.elderId,
    type: 'summary',
    level: 'medium',
    icon: item.icon,
    title: item.title,
    description: item.description,
    detail: item.description,
    timeLabel: '本周',
    status: item.tag === '已处理' ? 'resolved' : 'pending',
    statusLabel: item.tag,
    tag: item.tag,
    tagTone: item.tagTone,
    timeline: [],
    suggestion: ''
  }
}

function openAnomaly(item: ReportAnomaly) {
  if (item.alertId) {
    alertStore.setActiveAlert(item.alertId)
    goDetail('/pkg-family-detail/family/alert/index')
    return
  }
  toast(item.title)
}

function go(url: string) {
  goMainTab(url)
}

function openContact() {
  goDetail('/pkg-elder-detail/contact-detail/index')
}

function toast(title: string) {
  uni.showToast({ title: `${title}（演示）`, icon: 'none' })
}
</script>

<style scoped lang="scss">
.main {
  flex: 1;
  min-width: 0;
}

.hero-title {
  margin-top: 15px;
  font-size: 24px;
  line-height: 1.35;
  font-weight: 1000;
}

.hero-desc {
  margin-top: 8px;
  line-height: 1.5;
}

.score-ring {
  width: 88px;
  height: 88px;
  border-radius: 28px;
  background: #fff;
  border: 1px solid #d6e8d4;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.score-num {
  font-size: 28px;
  font-weight: 1000;
  color: #315943;
  line-height: 1;
}

.score-label {
  margin-top: 4px;
  font-size: 12px;
  font-weight: 1000;
  color: #7a6f5d;
}

.mini-stats {
  margin-top: 16px;
}

.stat-card {
  padding: 8px;
  text-align: center;
}

.stat-num {
  display: block;
  margin-top: 6px;
  font-size: 18px;
  font-weight: 1000;
  color: #243a31;
}

.stat-num.warm {
  color: #c9822c;
}

.stat-num.small {
  font-size: 16px;
}

.summary-card,
.advice-card {
  padding: 16px;
  border-radius: 28px;
}

.mascot-box {
  width: 48px;
  height: 48px;
  overflow: hidden;
}

.summary-title,
.advice-title {
  font-size: 18px;
  font-weight: 900;
}

.summary-copy,
.advice-copy {
  margin-top: 6px;
  line-height: 1.5;
  font-size: 14px;
}

.compact-top {
  margin-top: 0;
}

.trend-label {
  font-weight: 1000;
  font-size: 14px;
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

.section-gap {
  padding: 0 24px;
}

.action-row {
  margin-top: 16px;
}
</style>
