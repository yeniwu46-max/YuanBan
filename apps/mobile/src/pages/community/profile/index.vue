<template>
  <view class="app-page community-page">
    <CommunityPageHeader
      label="社区端 · 服务档案"
      title="老人档案"
      :show-back="false"
    />

    <view class="section">
      <view class="hero green profile-hero">
        <view class="row row-top">
          <view class="avatar iconbox">👤</view>
          <view class="flex1">
            <view class="pill">🛡️ 重点服务对象</view>
            <view class="profile-name">{{ profile.name }}</view>
            <view class="muted profile-meta">
              {{ profile.age }} 岁 · 独居 · 高血压慢病管理 · {{ profile.address }}
            </view>
          </view>
        </view>
        <view class="tag-row">
          <StatusTag v-for="(t, i) in profile.tags" :key="i" :label="t.label" :tone="t.tone === 'warm' ? 'warm' : 'normal'" />
        </view>
        <view class="grid4 profile-stats">
          <view class="card stat-mini"><text class="muted">健康分</text><text class="num">{{ profile.healthScore }}</text></view>
          <view class="card stat-mini"><text class="muted">告警</text><text class="num warm">{{ profile.alertCount }}次</text></view>
          <view class="card stat-mini"><text class="muted">服务</text><text class="num">{{ profile.serviceCount }}次</text></view>
          <view class="card stat-mini"><text class="muted">活动</text><text class="num">{{ profile.activityCount }}次</text></view>
        </view>
      </view>
    </view>

    <view class="section-title">
      <view class="h2">快捷操作</view>
    </view>
    <view class="section compact-top">
      <QuickActionGrid :actions="profileActions" @action="onProfileAction" />
    </view>

    <view class="section-title">
      <view class="h2">健康概况</view>
      <button class="link" @click="openReport">详细报告 ›</button>
    </view>
    <view class="section compact-top">
      <view class="grid2">
        <HealthMetricCard
          v-for="m in profile.metrics"
          :key="m.key"
          :metric="m"
          :icon="metricIcon(m.key)"
        />
      </view>
    </view>

    <view class="section-title">
      <view class="h2">近期风险记录</view>
      <text class="muted count-label">近 30 天</text>
    </view>
    <view class="list flush section-gap">
      <button
        v-for="risk in profile.riskRecords"
        :key="risk.id"
        class="row-card"
        @click="openRisk(risk.workOrderId)"
      >
        <view class="iconbox" :class="risk.iconTone">{{ risk.icon }}</view>
        <view class="row-main">
          <view class="row-title">{{ risk.title }}</view>
          <view class="row-desc">{{ risk.description }}</view>
        </view>
        <StatusTag :label="risk.tag" :tone="risk.tagTone === 'warm' ? 'warm' : 'normal'" />
      </button>
    </view>

    <view class="section-title">
      <view class="h2">服务记录</view>
      <button class="link" @click="goMainTab('/pages/community/workorders/index')">全部记录 ›</button>
    </view>
    <view class="section compact-top">
      <view class="card service-card">
        <view v-for="(sr, idx) in profile.serviceRecords" :key="sr.id" class="service-row">
          <view v-if="idx > 0" class="divider" />
          <view class="row">
            <view class="iconbox">{{ sr.icon }}</view>
            <view>
              <view class="duty-name">{{ sr.title }}</view>
              <view class="muted">{{ sr.detail }}</view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="section-title">
      <view class="h2">家属与联系人</view>
    </view>
    <view class="section compact-top">
      <view class="card contact-card">
        <view v-for="(c, idx) in profile.contacts" :key="c.id" class="contact-row">
          <view v-if="idx > 0" class="divider" />
          <view class="row">
            <view class="iconbox" :class="c.iconTone">👤</view>
            <view class="flex1">
              <view class="duty-name">{{ c.name }}</view>
              <view class="muted">{{ c.role }}</view>
            </view>
            <BigButton
              :tone="c.actionTone === 'warm' ? 'warm' : 'green'"
              class="mini-btn"
              @click="openContact"
            >
              {{ c.actionLabel }}
            </BigButton>
          </view>
        </view>
      </view>
    </view>

    <view class="section-title">
      <view class="h2">社区参与</view>
      <button class="link" @click="goActivity">活动记录 ›</button>
    </view>
    <view class="section compact-top">
      <view class="grid2">
        <button class="quick-card" @click="goActivity">
          <view class="iconbox">📅</view>
          <text class="qc-title">活动参与</text>
          <text class="muted qc-desc">{{ profile.participation.activityLabel }}</text>
        </button>
        <button class="quick-card" @click="toast('鼋气罐积分')">
          <view class="iconbox warm">🎁</view>
          <text class="qc-title">鼋气罐积分</text>
          <text class="muted qc-desc">{{ profile.participation.pointsLabel }}</text>
        </button>
      </view>
    </view>

    <view class="section">
      <view class="hero warm">
        <view class="row row-top">
          <view class="iconbox warm mascot-wrap">
            <YuanMascot size="small" />
          </view>
          <view class="flex1">
            <view class="batch-title">小鼋长期建议</view>
            <view class="muted">{{ profile.yuanSuggestion }}</view>
          </view>
        </view>
        <view class="grid2 action-row">
          <BigButton tone="warm" @click="goMainTab('/pages/community/workorders/index')">➤ 同步建议</BigButton>
          <BigButton tone="white" @click="toast('写入档案')">▤ 写入档案</BigButton>
        </view>
      </view>
    </view></view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { computed } from 'vue'
import BigButton from '@/components/BigButton.vue'
import HealthMetricCard from '@/components/HealthMetricCard.vue'
import StatusTag from '@/components/StatusTag.vue'
import YuanMascot from '@/components/YuanMascot.vue'
import CommunityPageHeader from '@/components/community/CommunityPageHeader.vue'
import QuickActionGrid from '@/components/community/QuickActionGrid.vue'
import { useCommunityProfileStore } from '@/stores/communityProfile'
import { goDetail, goMainTab } from '@/utils/navigate'

const profileStore = useCommunityProfileStore()
const profile = computed(() => profileStore.profile)

onShow(() => {
  void profileStore.hydrate('elder-001', { force: false })
})

const profileActions = [
  { key: 'call', icon: '☎', label: '联系' },
  { key: 'visit', icon: '🏠', label: '上门' },
  { key: 'edit', icon: '✎', label: '更新' },
  { key: 'export', icon: '↓', label: '导出' }
]

function metricIcon(key: string) {
  const map: Record<string, string> = {
    heartRate: '❤️',
    bloodPressure: '💧',
    sleep: '🌙',
    fallRisk: '📈'
  }
  return map[key] ?? '📊'
}

function toast(title?: string) {
  uni.showToast({ title: title ?? '功能演示', icon: 'none' })
}

function onProfileAction(key: string) {
  if (key === 'call') {
    openContact()
    return
  }
  if (key === 'visit') {
    goMainTab('/pages/community/workorders/index')
    return
  }
  if (key === 'edit') {
    openReport()
    return
  }
  toast(profileActions.find((item) => item.key === key)?.label)
}

function openReport() {
  goDetail('/pkg-elder-detail/health-report/index')
}

function openContact() {
  goDetail('/pkg-elder-detail/contact-detail/index')
}

function openRisk(workOrderId?: string) {
  if (workOrderId === 'wo-sos-018') {
    goDetail(`/pkg-community-detail/community/alert/index?id=wo-sos-018`)
    return
  }
  if (workOrderId) {
    goMainTab('/pages/community/workorders/index')
  }
}

function goActivity() {
  goMainTab('/pages/community/activity/index')
}
</script>

<style scoped>
.profile-hero {
  padding: 20px;
}

.avatar {
  width: 76px;
  height: 76px;
  border-radius: 26px;
  font-size: 38px;
}

.profile-name {
  margin-top: 12px;
  font-size: 24px;
  font-weight: 1000;
}

.profile-meta {
  line-height: 1.45;
  margin-top: 4px;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 15px;
}

.profile-stats {
  margin-top: 15px;
}

.mini-btn {
  width: 72px !important;
  height: 38px !important;
  font-size: 13px !important;
  padding: 0 !important;
}

.service-card,
.contact-card {
  padding: 16px;
}

.quick-card {
  min-height: 116px;
  border-radius: 24px;
  background: white;
  border: 1px solid #efe3ce;
  padding: 16px;
  text-align: left;
}

.qc-title {
  display: block;
  margin-top: 12px;
  font-weight: 1000;
}
</style>
