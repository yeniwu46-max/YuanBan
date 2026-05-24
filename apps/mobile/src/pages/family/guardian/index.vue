<template>
  <view class="app-page family-page">
    <view class="header">
      <ElderSwitcher />
      <button class="iconbtn">🔔</button>
    </view>

    <FamilyPageSkeleton v-if="switching" />

    <template v-else>
      <view class="section">
        <GuardScoreCard
          v-if="elder && summary"
          :headline="summary.safetyHeadline"
          :last-sync-label="elder.lastSyncLabel"
          :activity-label="elder.activityLabel"
          :guard-score="elder.guardScore"
          :device-count="elder.deviceCount"
          :risk-count="elder.riskCount"
          :medicine-done-percent="elder.medicineDonePercent"
        />
      </view>

      <view class="section-title">
        <view class="h2">快捷关怀</view>
      </view>
      <view class="section compact-top">
        <QuickCareGrid @action="onQuickCare" />
      </view>

      <view class="section-title">
        <view class="h2">风险提醒</view>
        <button v-if="pendingAlerts.length" class="link" @click="showAllAlerts">查看全部 ›</button>
      </view>
      <view class="list flush section-gap">
        <AlertCard
          v-for="item in visibleAlerts"
          :key="item.id"
          :alert="item"
          @click="openAlert(item.id)"
        />
        <FamilyEmptyState
          v-if="!elderAlerts.length"
          icon="✅"
          title="暂无风险提醒"
          description="老人当前状态平稳，有新异常时会第一时间通知您。"
          action-label="查看健康报告"
          @action="go('/pages/family/report/index')"
        />
      </view>

      <view class="section-title">
        <view class="h2">健康摘要</view>
        <button class="link" @click="go('/pages/family/report/index')">查看报告 ›</button>
      </view>
      <view class="section compact-top">
        <view v-if="report?.metrics?.length" class="grid2">
          <HealthMetricCard
            v-for="item in report.metrics.slice(0, 4)"
            :key="item.key"
            :metric="item"
            :icon="metricIcon(item.key)"
          />
        </view>
        <FamilyEmptyState
          v-else
          icon="📊"
          title="暂无健康摘要"
          description="设备恢复在线后，会自动同步最新体征数据。"
        />
      </view>

      <view class="section">
        <view class="hero warm suggestion-card">
          <view class="row row-top">
            <view class="iconbox warm mascot-box">
              <YuanMascot size="small" />
            </view>
            <view class="suggestion-main">
              <view class="suggestion-title">小鼋关怀建议</view>
              <view class="muted suggestion-copy">{{ summary?.companionSuggestion }}</view>
            </view>
          </view>
          <view class="grid2 action-row">
            <BigButton tone="green" @click="go('/pages/family/care/index')">➤ 发关怀消息</BigButton>
            <BigButton tone="white" @click="go('/pages/family/care/index')">💬 查看建议</BigButton>
          </view>
        </view>
      </view>
    </template>

    <FamilyBottomNav active="guardian" />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BigButton from '@/components/BigButton.vue'
import HealthMetricCard from '@/components/HealthMetricCard.vue'
import YuanMascot from '@/components/YuanMascot.vue'
import AlertCard from '@/components/family/AlertCard.vue'
import ElderSwitcher from '@/components/family/ElderSwitcher.vue'
import FamilyBottomNav from '@/components/family/FamilyBottomNav.vue'
import FamilyEmptyState from '@/components/family/FamilyEmptyState.vue'
import FamilyPageSkeleton from '@/components/family/FamilyPageSkeleton.vue'
import GuardScoreCard from '@/components/family/GuardScoreCard.vue'
import QuickCareGrid from '@/components/family/QuickCareGrid.vue'
import type { QuickCareAction } from '@/components/family/QuickCareGrid.vue'
import { useFamilyElderContext } from '@/composables/useFamilyElderContext'
import { goDetail, goMainTab } from '@/utils/navigate'

const {
  elder,
  summary,
  switching,
  elderAlerts,
  report,
  alertStore
} = useFamilyElderContext()

const visibleAlerts = computed(() => elderAlerts.value.slice(0, 3))
const pendingAlerts = computed(() => elderAlerts.value.filter((item) => item.status !== 'resolved'))

function metricIcon(key: string) {
  const map: Record<string, string> = {
    heartRate: '❤️',
    breathRate: '🌬️',
    bloodPressure: '💧',
    sleep: '🌙'
  }
  return map[key] ?? '📊'
}

function go(url: string) {
  goMainTab(url)
}

function openAlert(alertId: string) {
  alertStore.setActiveAlert(alertId)
  goDetail('/pages/family/alert/index')
}

function showAllAlerts() {
  const firstPending = pendingAlerts.value[0]
  if (firstPending) {
    openAlert(firstPending.id)
    return
  }
  if (elderAlerts.value[0]) {
    openAlert(elderAlerts.value[0].id)
  }
}

const quickCareLabels: Record<QuickCareAction, string> = {
  video: '视频关怀',
  phone: '电话关怀',
  voice: '语音留言',
  location: '查看位置',
  photo: '上传照片'
}

function onQuickCare(action: QuickCareAction) {
  uni.showToast({ title: `${quickCareLabels[action]}（演示）`, icon: 'none' })
}
</script>

<style scoped lang="scss">
.header {
  position: relative;
  z-index: 2;
  padding: 30px 24px 14px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.compact-top {
  margin-top: 0;
}

.section-gap {
  padding: 0 24px;
}

.suggestion-card {
  padding: 16px;
  border-radius: 28px;
}

.mascot-box {
  width: 48px;
  height: 48px;
  overflow: hidden;
}

.suggestion-title {
  font-size: 18px;
  font-weight: 900;
  color: #243a31;
}

.suggestion-copy {
  margin-top: 6px;
  line-height: 1.5;
  font-size: 14px;
}

.action-row {
  margin-top: 16px;
}
</style>
