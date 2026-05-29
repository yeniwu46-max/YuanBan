<template>
  <view class="app-page community-page">
    <CommunityPageHeader label="社区端 · 工单中心" title="工单列表" />

    <view class="section">
      <StatsHero
        pill="📋 今日工单池"
        :headline="`当前待处理 ${pool.pendingCount} 项，其中紧急 ${pool.urgentCount} 项。`"
        :subtitle="`按优先级自动排序 · 值班社工：${site.dutyStaff}`"
        :badge-value="pool.totalCount"
        badge-label="总工单"
        :stats="poolStats"
      />
    </view>

    <view class="section-title">
      <view class="h2">工单操作</view>
    </view>
    <view class="section compact-top">
      <QuickActionGrid :actions="woActions" @action="onWorkOrderAction" />
    </view>

    <view class="section">
      <view class="card search-card">
        <view class="row">
          <text class="search-icon">⌕</text>
          <text class="muted">搜索老人姓名 / 工单编号 / 地址</text>
        </view>
      </view>
    </view>

    <view class="section-title">
      <view class="h2">工单分类</view>
      <button class="link" @click="toast('更多条件')">更多条件 ›</button>
    </view>
    <view class="section compact-top">
      <view class="tabbar">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-btn"
          :class="{ active: activeTab === tab.key }"
          @click="setTab(tab.key)"
        >
          {{ tab.label }}
        </button>
      </view>
    </view>

    <view class="list flush section-gap">
      <WorkOrderCard
        v-for="order in filteredOrders"
        :key="order.id"
        :order="order"
        @click="openOrder(order)"
      />
      <CommunityEmptyState
        v-if="!filteredOrders.length"
        icon="📋"
        title="该分类暂无工单"
        description="可切换其他分类查看，或新建工单。"
      />
    </view>

    <view class="section-title">
      <view class="h2">批量处理</view>
    </view>
    <view class="section compact-top">
      <view class="card batch-card">
        <view class="row row-top">
          <view class="iconbox">✓</view>
          <view>
            <view class="batch-title">建议优先处理紧急与高优先级工单</view>
            <view class="muted">系统已根据告警等级、等待时长、老人风险标签自动排序。</view>
          </view>
        </view>
        <view class="grid2 action-row">
          <BigButton tone="green" @click="toast('批量回访')">☎ 批量回访</BigButton>
          <BigButton tone="white" @click="toast('生成日报')">▤ 生成日报</BigButton>
        </view>
      </view>
    </view>

    <view class="section-title">
      <view class="h2">值班分配</view>
    </view>
    <view class="section compact-top">
      <view class="hero gray duty-card">
        <view v-for="(s, idx) in staff" :key="s.id" class="duty-row">
          <view v-if="idx > 0" class="divider" />
          <view class="row">
            <view class="iconbox" :class="s.statusTone === 'warm' ? 'warm' : ''">👤</view>
            <view class="flex1">
              <view class="duty-name">{{ s.name }}</view>
              <view class="muted">{{ s.workload }}</view>
            </view>
            <StatusTag :label="s.statusLabel" :tone="s.statusTone === 'warm' ? 'warm' : 'normal'" />
          </view>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="hero warm">
        <view class="row row-top">
          <view class="iconbox warm mascot-wrap">
            <YuanMascot size="small" />
          </view>
          <view class="flex1">
            <view class="batch-title">小鼋派单建议</view>
            <view class="muted">建议王社工优先处理李奶奶 SOS 工单；设备类工单可分配给陈社工。</view>
          </view>
        </view>
        <view class="grid2 action-row">
          <BigButton tone="warm" @click="toast('一键派单')">➤ 一键派单</BigButton>
          <BigButton tone="white" @click="toast('通知值班')">💬 通知值班</BigButton>
        </view>
      </view>
    </view></view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { computed } from 'vue'
import BigButton from '@/components/BigButton.vue'
import StatusTag from '@/components/StatusTag.vue'
import YuanMascot from '@/components/YuanMascot.vue'
import CommunityEmptyState from '@/components/community/CommunityEmptyState.vue'
import CommunityPageHeader from '@/components/community/CommunityPageHeader.vue'
import QuickActionGrid from '@/components/community/QuickActionGrid.vue'
import StatsHero from '@/components/community/StatsHero.vue'
import WorkOrderCard from '@/components/community/WorkOrderCard.vue'
import { useCommunityStore } from '@/stores/community'
import { useCommunityWorkorderStore } from '@/stores/communityWorkorder'
import type { WorkOrder, WorkOrderTab } from '@/types/community'
import { goDetail, goMainTab } from '@/utils/navigate'

const community = useCommunityStore()
const workorder = useCommunityWorkorderStore()

onShow(() => {
  void workorder.fetchOrders()
})

const site = computed(() => community.site)
const pool = computed(() => workorder.poolStats)
const activeTab = computed(() => workorder.activeTab)
const filteredOrders = computed(() => workorder.filteredOrders)
const staff = computed(() => workorder.staff)

const tabs: { key: WorkOrderTab; label: string }[] = [
  { key: 'urgent', label: '紧急' },
  { key: 'visit', label: '上门' },
  { key: 'device', label: '设备' },
  { key: 'done', label: '完成' }
]

const poolStats = computed(() => [
  { label: '紧急', value: pool.value.urgentCount, tone: 'red' },
  { label: '上门', value: pool.value.visitCount, tone: 'warm' },
  { label: '设备', value: 3 },
  { label: '完成', value: pool.value.doneCount }
])

const woActions = [
  { key: 'new', icon: '＋', label: '新建' },
  { key: 'filter', icon: '☰', label: '筛选' },
  { key: 'sort', icon: '↕', label: '排序' },
  { key: 'export', icon: '↓', label: '导出' }
]

function setTab(tab: WorkOrderTab) {
  workorder.setTab(tab)
}

function openOrder(order: WorkOrder) {
  if (order.tab === 'urgent') {
    goDetail(`/pkg-community-detail/community/alert/index?id=${order.id}`)
    return
  }
  goDetail('/pages/community/profile/index')
}

function onWorkOrderAction(key: string) {
  if (key === 'new') {
    workorder.setTab('urgent')
    toast('已切到紧急工单池')
    goMainTab('/pages/community/workorders/index')
    return
  }
  if (key === 'filter' || key === 'sort' || key === 'export') {
    toast(woActions.find((item) => item.key === key)?.label)
  }
}

function toast(msg?: string) {
  uni.showToast({ title: msg ?? '功能演示', icon: 'none' })
}
</script>

<style scoped>
.search-card {
  padding: 16px;
}

.search-icon {
  font-size: 24px;
}

.tabbar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  border-radius: 22px;
  background: #f1ece1;
  padding: 6px;
}

.tab-btn {
  height: 42px;
  border-radius: 16px;
  background: transparent;
  color: #8c806c;
  font-weight: 1000;
  font-size: 14px;
}

.tab-btn.active {
  background: white;
  color: #315943;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.batch-card,
.duty-card {
  padding: 16px;
}

.batch-title {
  font-size: 18px;
  font-weight: 1000;
}

.duty-name {
  font-size: 16px;
  font-weight: 1000;
}

.divider {
  height: 1px;
  background: #e6edd8;
  margin: 14px 0;
}

.mascot-wrap {
  flex-shrink: 0;
}
</style>
