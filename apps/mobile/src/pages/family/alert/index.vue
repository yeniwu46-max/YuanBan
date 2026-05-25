<template>
  <view class="app-page family-page">
    <AppHeader
      label="子女端 · 告警处理"
      title="告警详情"
      back="/pages/family/guardian/index"
      compact
    />

    <template v-if="alert && elder && alertBelongsToCurrentElder">
      <view class="section">
        <view class="hero red">
          <view class="between row-top">
            <view class="main">
              <view class="pill red-pill">{{ levelPill }}</view>
              <view class="hero-title">{{ elder.name }}{{ alert.title }}，建议今晚关注。</view>
              <view class="muted hero-desc">{{ alert.detail }}</view>
            </view>
            <view class="iconbox red alert-icon">{{ alert.icon }}</view>
          </view>
          <view class="grid3 stats">
            <view class="card stat-card">
              <text class="muted">等级</text>
              <text class="stat-num warm">{{ levelLabel }}</text>
            </view>
            <view class="card stat-card">
              <text class="muted">时间</text>
              <text class="stat-num">{{ timeShort }}</text>
            </view>
            <view class="card stat-card">
              <text class="muted">状态</text>
              <text class="stat-num" :class="{ warm: alert.status !== 'resolved' }">{{ alert.statusLabel }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="grid2">
          <BigButton tone="green" @click="toast('联系老人')">☎ 联系老人</BigButton>
          <BigButton tone="white" @click="toast('发起视频')">📹 发起视频</BigButton>
        </view>
      </view>

      <view class="section-title">
        <view class="h2">处理进度</view>
        <text class="status-text" :class="{ warm: alert.status !== 'resolved' }">{{ progressLabel }}</text>
      </view>
      <view class="section compact-top">
        <AlertTimeline :steps="alert.timeline" />
      </view>

      <view class="section-title">
        <view class="h2">老人当前状态</view>
        <button class="link" @click="go('/pages/family/report/index')">查看报告 ›</button>
      </view>
      <view class="section compact-top">
        <view class="grid2">
          <HealthMetricCard :metric="metric('heartRate')" icon="❤️" />
          <HealthMetricCard :metric="metric('breathRate')" icon="🌬️" />
          <HealthMetricCard :metric="metric('bloodPressure')" icon="💧" />
          <button class="health device-card">
            <view class="iconbox">📶</view>
            <view class="smalltitle">设备</view>
            <view class="val">
              <text class="num device-num">{{ elder.online ? '在线' : '离线' }}</text>
            </view>
            <view class="status">{{ elder.lastSyncLabel }}</view>
          </button>
        </view>
      </view>

      <view class="section">
        <view class="hero warm suggestion-card">
          <view class="row row-top">
            <view class="iconbox warm mascot-box">
              <YuanMascot size="small" />
            </view>
            <view class="suggestion-main">
              <view class="suggestion-title">小鼋处理建议</view>
              <view class="muted suggestion-copy">{{ alert.suggestion }}</view>
            </view>
          </view>
          <view class="grid2 action-row">
            <BigButton tone="warm" @click="toast('发送提醒')">➤ 发送提醒</BigButton>
            <BigButton tone="white" @click="toast('语音留言')">🎙 语音留言</BigButton>
          </view>
        </view>
      </view>

      <view class="section-title">
        <view class="h2">推荐处理</view>
      </view>
      <view class="list flush section-gap">
        <ListItem
          v-for="item in recommendedActions"
          :key="item.id"
          :icon="item.icon"
          :icon-tone="item.iconTone"
          :title="item.title"
          :desc="item.description"
          @click="toast(item.title)"
        />
      </view>

      <view class="section">
        <view class="card result-card">
          <view class="row row-top">
            <view class="iconbox">📋</view>
            <view>
              <view class="result-title">处理结果</view>
              <view class="muted result-copy">联系老人后，可记录并关闭本次提醒。</view>
            </view>
          </view>
          <view class="grid2 action-row">
            <BigButton tone="green" @click="handleResolve">✓ 已处理</BigButton>
            <BigButton tone="white" @click="handlePending">⏳ 稍后处理</BigButton>
          </view>
        </view>
      </view>
    </template>

    <view v-else class="section">
      <FamilyEmptyState
        icon="⚠️"
        title="暂无告警详情"
        description="请从守护首页选择一条风险提醒，或返回查看最新状态。"
        action-label="返回守护首页"
        @action="go('/pages/family/guardian/index')"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import BigButton from '@/components/BigButton.vue'
import HealthMetricCard from '@/components/HealthMetricCard.vue'
import ListItem from '@/components/ListItem.vue'
import YuanMascot from '@/components/YuanMascot.vue'
import AlertTimeline from '@/components/family/AlertTimeline.vue'
import FamilyEmptyState from '@/components/family/FamilyEmptyState.vue'
import { getRecommendedActions } from '@/services/familyService'
import { useFamilyElderContext } from '@/composables/useFamilyElderContext'
import { syncFamilyDerivedState } from '@/stores/familySync'
import { goBack, goHome } from '@/utils/navigate'
import type { AlertLevel } from '@/types/family'
import type { HealthMetric } from '@/types/elder'

const { elder, elderId, alertStore, guardian, report } = useFamilyElderContext()
const recommendedActions = getRecommendedActions()

const alert = computed(() => alertStore.activeAlert)
const alertBelongsToCurrentElder = computed(
  () => !!alert.value && alert.value.elderId === elderId.value
)

const levelMap: Record<AlertLevel, string> = {
  low: '低',
  medium: '中',
  high: '高'
}

const levelPillMap: Record<AlertLevel, string> = {
  low: 'ℹ️ 低风险提醒',
  medium: '⚠️ 中风险提醒',
  high: '🚨 高风险提醒'
}

const levelLabel = computed(() => (alert.value ? levelMap[alert.value.level] : ''))
const levelPill = computed(() => (alert.value ? levelPillMap[alert.value.level] : ''))
const timeShort = computed(() => {
  if (!alert.value) return ''
  const match = alert.value.timeLabel.match(/\d{2}:\d{2}/)
  return match?.[0] ?? alert.value.timeLabel
})

const progressLabel = computed(() => {
  if (!alert.value) return ''
  if (alert.value.status === 'resolved') return '已完成'
  if (alert.value.status === 'processing') return '进行中'
  return '进行中'
})

watch(
  () => alert.value?.id,
  (id) => {
    if (!id || !alert.value) return
    if (alert.value.elderId !== elderId.value) {
      guardian.setCurrentElder(alert.value.elderId)
    }
    if (alert.value.status === 'pending') {
      alertStore.confirmAlert(id)
      syncFamilyDerivedState()
    }
  },
  { immediate: true }
)

function metric(key: string): HealthMetric {
  const fromReport = report.value?.metrics.find((item) => item.key === key)
  if (fromReport) return fromReport
  return {
    key: key as HealthMetric['key'],
    label: key,
    value: '--',
    status: 'normal',
    description: '暂无数据'
  }
}

function go(url: string) {
  goHome(url)
}

function toast(title: string) {
  uni.showToast({ title: `${title}（演示）`, icon: 'none' })
}

function handleResolve() {
  if (!alert.value) return
  alertStore.resolveAlert(alert.value.id)
  syncFamilyDerivedState()
  uni.showToast({ title: '已记录处理结果', icon: 'none' })
  setTimeout(() => goBack('/pages/family/guardian/index'), 300)
}

function handlePending() {
  if (!alert.value) return
  alertStore.markPending(alert.value.id)
  syncFamilyDerivedState()
  uni.showToast({ title: '已标记稍后处理', icon: 'none' })
  setTimeout(() => goBack('/pages/family/guardian/index'), 300)
}
</script>

<style scoped lang="scss">
.main {
  flex: 1;
  min-width: 0;
}

.red-pill {
  color: #e56b5f;
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

.alert-icon {
  width: 88px;
  height: 88px;
  border-radius: 28px;
  font-size: 42px;
}

.stats {
  margin-top: 16px;
}

.stat-card {
  padding: 12px;
  text-align: center;
}

.stat-num {
  display: block;
  margin-top: 6px;
  font-size: 20px;
  font-weight: 1000;
  color: #243a31;
}

.stat-num.warm {
  color: #c9822c;
}

.compact-top {
  margin-top: 0;
}

.status-text {
  font-weight: 1000;
  color: #5b8b62;
  font-size: 15px;
}

.status-text.warm {
  color: #c9822c;
}

.section-gap {
  padding: 0 24px;
}

.device-card {
  text-align: left;
}

.device-num {
  font-size: 22px;
}

.suggestion-card,
.result-card {
  padding: 16px;
  border-radius: 28px;
}

.mascot-box {
  width: 48px;
  height: 48px;
  overflow: hidden;
}

.suggestion-title,
.result-title {
  font-size: 18px;
  font-weight: 900;
}

.suggestion-copy,
.result-copy {
  margin-top: 6px;
  line-height: 1.5;
  font-size: 14px;
}

.action-row {
  margin-top: 16px;
}

.empty-card {
  padding: 24px 16px;
  text-align: center;
}
</style>
