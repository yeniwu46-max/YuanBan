<template>
  <view class="app-page community-page">
    <CommunityPageHeader label="社区端 · 活动管理" title="银龄活动" />

    <view class="section">
      <StatsHero
        pill="📅 今日活动总览"
        :headline="`今日 ${overview.todayCount} 场活动，共 ${overview.totalEnrolled} 位老人报名。`"
        :subtitle="`${overview.inProgressCount} 场进行中 · ${overview.pendingCheckInCount} 人待签到 · ${overview.endedCount} 场已结束`"
        :badge-value="overview.totalEnrolled"
        badge-label="报名人数"
        :stats="actStats"
      />
    </view>

    <view class="section-title">
      <view class="h2">快捷操作</view>
    </view>
    <view class="section compact-top">
      <QuickActionGrid :actions="actActions" @action="onActivityAction" />
    </view>

    <view class="section-title">
      <view class="h2">进行中活动</view>
      <button class="link" @click="focusCheckIn">现场管理 ›</button>
    </view>
    <view class="section compact-top" v-if="featured">
      <view class="hero warm featured">
        <view class="row">
          <view class="iconbox warm">☯</view>
          <view class="flex1">
            <view class="feat-title">{{ featured.title }}</view>
            <view class="muted">{{ featured.description }}</view>
          </view>
          <StatusTag :label="featured.tag" :tone="featured.tagTone === 'warm' ? 'warm' : 'normal'" />
        </view>
        <view class="grid3 mini-stats">
          <view class="card stat-mini"><text class="muted text-nowrap">报名</text><text class="num text-nowrap">{{ featured.enrolled }}</text></view>
          <view class="card stat-mini"><text class="muted text-nowrap">签到</text><text class="num text-nowrap">{{ featured.checkedIn }}</text></view>
          <view class="card stat-mini"><text class="muted text-nowrap">待签</text><text class="num warm text-nowrap">{{ featured.pendingCheckIn }}</text></view>
        </view>
        <view class="grid2 action-row">
          <BigButton tone="green" @click="focusCheckIn">▣ 签到核销</BigButton>
          <BigButton tone="white" @click="focusCheckIn">👥 报名名单</BigButton>
        </view>
      </view>
    </view>

    <view class="section-title">
      <view class="h2">活动列表</view>
      <button class="link" @click="toast('筛选')">筛选 ☰</button>
    </view>
    <view class="list flush section-gap">
      <button v-for="act in activities" :key="act.id" class="row-card static-card" @click="openActivity(act.id)">
        <view class="iconbox" :class="act.iconTone">{{ act.icon }}</view>
        <view class="row-main">
          <view class="row-title">{{ act.title }}</view>
          <view class="row-desc">{{ act.description }}</view>
        </view>
        <StatusTag :label="act.tag" :tone="act.tagTone === 'warm' ? 'warm' : 'normal'" />
      </button>
    </view>

    <view class="section-title">
      <view class="h2">签到管理</view>
      <text class="muted count-label">太极课</text>
    </view>
    <view class="section compact-top">
      <view class="card checkin-card">
        <view v-for="(c, idx) in checkIns" :key="c.id" class="checkin-row">
          <view v-if="idx > 0" class="divider" />
          <view class="row">
            <view class="iconbox" :class="c.tagTone === 'warm' ? 'warm' : ''">{{ c.tag === '已签到' ? '✓' : '👤' }}</view>
            <view class="flex1">
              <view class="duty-name">{{ c.elderName }}</view>
              <view class="muted">{{ c.detail }}</view>
            </view>
            <StatusTag :label="c.tag" :tone="c.tagTone === 'warm' ? 'warm' : 'normal'" />
          </view>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="hero gray">
        <view class="row row-top">
          <view class="iconbox">💬</view>
          <view class="flex1">
            <view class="batch-title">活动通知模板</view>
            <view class="muted">「李奶奶已报名今日太极体验课，活动结束后将同步参与记录和鼋气罐积分。」</view>
          </view>
        </view>
        <view class="grid2 action-row">
          <BigButton tone="green" @click="toast('通知家属')">➤ 通知家属</BigButton>
          <BigButton tone="white" @click="toast('修改模板')">✎ 修改模板</BigButton>
        </view>
      </view>
    </view>

    <view class="section-title">
      <view class="h2">活动归档</view>
    </view>
    <view class="section compact-top">
      <view class="grid2">
        <button class="quick-card" @click="toast('生成服务记录')">
          <view class="iconbox">▤</view>
          <text class="qc-title">生成服务记录</text>
          <text class="muted qc-desc">写入老人服务档案</text>
        </button>
        <button class="quick-card" @click="toast('发放鼋气罐')">
          <view class="iconbox warm">🎁</view>
          <text class="qc-title">发放鼋气罐</text>
          <text class="muted qc-desc">参与老人 +20 积分</text>
        </button>
      </view>
    </view></view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { computed } from 'vue'
import BigButton from '@/components/BigButton.vue'
import StatusTag from '@/components/StatusTag.vue'
import CommunityPageHeader from '@/components/community/CommunityPageHeader.vue'
import QuickActionGrid from '@/components/community/QuickActionGrid.vue'
import StatsHero from '@/components/community/StatsHero.vue'
import { useCommunityActivityStore } from '@/stores/communityActivity'
import { goMainTab } from '@/utils/navigate'

const activityStore = useCommunityActivityStore()

const overview = computed(() => activityStore.overview)
const activities = computed(() => activityStore.activities)
const checkIns = computed(() => activityStore.checkIns)
const featured = computed(() => activities.value[0])

onShow(() => {
  void activityStore.hydrate({ force: false })
})

const actStats = computed(() => [
  { label: '活动', value: overview.value.todayCount },
  { label: '签到', value: overview.value.checkInTotal },
  { label: '待签到', value: overview.value.pendingCheckInCount, tone: 'warm' },
  { label: '积分', value: overview.value.pointsLabel }
])

const actActions = [
  { key: 'new', icon: '＋', label: '新建' },
  { key: 'checkin', icon: '▣', label: '签到' },
  { key: 'notify', icon: '📣', label: '通知' },
  { key: 'export', icon: '↓', label: '导出' }
]

function toast(title?: string) {
  uni.showToast({ title: title ?? '功能演示', icon: 'none' })
}

function onActivityAction(key: string) {
  if (key === 'checkin') {
    focusCheckIn()
    return
  }
  if (key === 'notify') {
    toast('已准备通知家属')
    return
  }
  toast(actActions.find((item) => item.key === key)?.label)
}

function focusCheckIn() {
  uni.showToast({ title: '已定位到签到管理', icon: 'none' })
}

function openActivity(activityId: string) {
  if (activityId === 'act-taiji') {
    focusCheckIn()
    return
  }
  goMainTab('/pages/community/profile/index')
}
</script>

<style scoped>
.featured {
  padding: 20px;
}

.feat-title {
  font-size: 19px;
  font-weight: 1000;
}

.mini-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 16px;
}

.stat-mini {
  padding: 10px;
  text-align: center;
}

.stat-mini .num {
  display: block;
  margin-top: 4px;
  font-size: 21px;
  font-weight: 1000;
}

.stat-mini .num.warm {
  color: #c9822c;
}

.static-card {
  min-height: 82px;
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  border: 1px solid #efe3ce;
  border-radius: 24px;
  box-shadow: 0 4px 12px rgba(63, 52, 29, 0.05);
}

.checkin-card {
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
  font-size: 16px;
}

.qc-desc {
  font-size: 13px;
  margin-top: 4px;
}
</style>
