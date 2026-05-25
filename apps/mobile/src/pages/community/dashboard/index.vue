<template>
  <view class="app-page community-page">
    <CommunityPageHeader
      label="社区端 · 服务工作台"
      :title="site.name"
      :notify-dot="stats.urgentCount > 0"
    />

    <view class="section">
      <StatsHero
        pill="📋 今日工单总览"
        :headline="`今日待处理 ${stats.pendingCount} 项，其中紧急告警 ${stats.urgentCount} 项。`"
        :subtitle="`当前值班：${site.dutyStaff} · 设备在线率 ${site.deviceOnlineRate}% · ${site.serviceStatusLabel}`"
        :badge-value="stats.totalCount"
        badge-label="总工单"
        :stats="heroStats"
      />
    </view>

    <view class="section-title">
      <view class="h2">快捷操作</view>
    </view>
    <view class="section compact-top">
      <QuickActionGrid :actions="quickActions" @action="onQuick" />
    </view>

    <view class="section-title">
      <view class="h2">运营概览</view>
    </view>
    <view class="section compact-top">
      <view class="grid2">
        <OpsMetricCard v-for="m in ops" :key="m.key" :metric="m" @click="toast(m.title)" />
      </view>
    </view>

    <view class="section-title">
      <view class="h2">紧急告警</view>
      <button class="link" @click="goTab('workorders')">全部工单 ›</button>
    </view>
    <view class="list flush section-gap">
      <WorkOrderCard
        v-for="item in urgentItems"
        :key="item.id"
        :order="urgentToOrder(item)"
        @click="openAlert(item.id)"
      />
      <CommunityEmptyState
        v-if="!urgentItems.length"
        icon="✅"
        title="暂无紧急告警"
        description="当前没有待处理的紧急工单。"
        action-label="查看工单列表"
        @action="goTab('workorders')"
      />
    </view>

    <view class="section-title">
      <view class="h2">社区活动</view>
      <button class="link" @click="goTab('activity')">管理活动 ›</button>
    </view>
    <view class="section compact-top">
      <view class="card activity-card">
        <view class="row">
          <view class="iconbox warm">📅</view>
          <view class="flex1">
            <view class="act-title">今日活动：{{ todayActivity.title }}</view>
            <view class="muted act-desc">
              {{ todayActivity.timeLabel }} · {{ todayActivity.location }} · 已报名 {{ todayActivity.enrolled }} 人，待签到 {{ todayActivity.pendingCheckIn }} 人
            </view>
          </view>
          <StatusTag :label="todayActivity.statusLabel" :tone="todayActivity.statusTone === 'warm' ? 'warm' : 'normal'" />
        </view>
        <view class="grid2 action-row">
          <BigButton tone="green" @click="toast('活动签到')">✓ 活动签到</BigButton>
          <BigButton tone="white" @click="toast('查看名单')">▤ 查看名单</BigButton>
        </view>
      </view>
    </view>

    <view class="section-title">
      <view class="h2">重点关注老人</view>
      <text class="muted count-label">今日 {{ focusList.length }} 位</text>
    </view>
    <view class="list flush section-gap">
      <button
        v-for="elder in focusList"
        :key="elder.elderId"
        class="row-card"
        @click="goProfile"
      >
        <view class="iconbox" :class="elder.iconTone">{{ elder.icon }}</view>
        <view class="row-main">
          <view class="row-title">{{ elder.name }}</view>
          <view class="row-desc">{{ elder.description }}</view>
        </view>
        <text class="chev">›</text>
      </button>
    </view>

    <CommunityBottomNav active="dashboard" />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BigButton from '@/components/BigButton.vue'
import StatusTag from '@/components/StatusTag.vue'
import CommunityBottomNav from '@/components/community/CommunityBottomNav.vue'
import CommunityEmptyState from '@/components/community/CommunityEmptyState.vue'
import CommunityPageHeader from '@/components/community/CommunityPageHeader.vue'
import OpsMetricCard from '@/components/community/OpsMetricCard.vue'
import QuickActionGrid from '@/components/community/QuickActionGrid.vue'
import StatsHero from '@/components/community/StatsHero.vue'
import WorkOrderCard from '@/components/community/WorkOrderCard.vue'
import { useCommunityDashboardStore } from '@/stores/communityDashboard'
import { useCommunityStore } from '@/stores/community'
import type { UrgentWorkItem, WorkOrder } from '@/types/community'
import { goDetail, goMainTab } from '@/utils/navigate'

const community = useCommunityStore()
const dashboard = useCommunityDashboardStore()

const site = computed(() => community.site)
const stats = computed(() => dashboard.stats)
const ops = computed(() => dashboard.ops)
const urgentItems = computed(() => dashboard.urgentItems)
const todayActivity = computed(() => dashboard.todayActivity)
const focusList = computed(() => dashboard.focusList)

const heroStats = computed(() => [
  { label: '紧急', value: stats.value.urgentCount, tone: 'warm' },
  { label: '上门', value: stats.value.visitCount },
  { label: '活动', value: stats.value.activityCount },
  { label: '完成', value: stats.value.doneCount }
])

const quickActions = [
  { key: 'new', icon: '＋', label: '新建工单' },
  { key: 'activity', icon: '📅', label: '发活动' },
  { key: 'visit', icon: '🏠', label: '上门服务' },
  { key: 'device', icon: '⌕', label: '巡检设备' }
]

function urgentToOrder(item: UrgentWorkItem): WorkOrder {
  return {
    id: item.id,
    code: '',
    tab: 'urgent',
    icon: item.icon,
    iconTone: item.iconTone,
    title: item.title,
    description: item.description,
    tag: item.tag,
    tagTone: item.tagTone,
    status: 'pending'
  }
}

function toast(title: string) {
  uni.showToast({ title, icon: 'none' })
}

function onQuick(key: string) {
  if (key === 'activity') {
    goTab('activity')
    return
  }
  toast(quickActions.find((a) => a.key === key)?.label ?? '功能演示')
}

function goTab(tab: 'workorders' | 'activity') {
  goMainTab(`/pages/community/${tab}/index`)
}

function openAlert(id: string) {
  goDetail(`/pages/community/alert/index?id=${id}`)
}

function goProfile() {
  goMainTab('/pages/community/profile/index')
}
</script>

<style scoped>
.compact-top {
  margin-top: 0;
}

.section-gap {
  padding: 0 24px;
}

.activity-card {
  padding: 16px;
}

.act-title {
  font-size: 18px;
  font-weight: 1000;
}

.act-desc {
  margin-top: 5px;
  line-height: 1.4;
}

.action-row {
  margin-top: 16px;
}

.flex1 {
  flex: 1;
  min-width: 0;
}

.count-label {
  font-weight: 1000;
}
</style>
