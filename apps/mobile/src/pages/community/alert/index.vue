<template>
  <view class="app-page community-page alert-page">
    <CommunityPageHeader
      label="社区端 · 告警工单"
      title="工单详情"
      show-back
      back-fallback="/pages/community/dashboard/index"
    />

    <template v-if="detail">
      <view class="section">
        <StatsHero
          :tone="heroTone"
          :pill="finished ? '✓ 工单已完成' : '🚨 紧急告警工单'"
          :headline="finished ? detail.finishedHeadline : detail.headline"
          :subtitle="finished ? detail.finishedDescription : detail.description"
          :badge-icon="finished ? '✓' : '🚨'"
          :badge-tone="finished ? '' : 'red'"
          :stats="heroMiniStats"
          :grid-cols="3"
        />
      </view>

      <view class="section">
        <view class="grid2">
          <BigButton tone="red" @click="toast('电话确认')">☎ 电话确认</BigButton>
          <BigButton tone="white" @click="toast('导航上门')">🧭 导航上门</BigButton>
        </view>
      </view>

      <view class="section-title">
        <view class="h2">工单信息</view>
        <text class="muted code-label">{{ detail.code }}</text>
      </view>
      <view class="list flush section-gap">
        <button class="row-card" @click="goProfile">
          <view class="iconbox warm">👤</view>
          <view class="row-main">
            <view class="row-title">服务对象</view>
            <view class="row-desc">
              {{ detail.elderName }} · {{ detail.elderAge }} 岁 · {{ detail.elderTags.join(' · ') }}
            </view>
          </view>
          <StatusTag label="重点" tone="warm" />
        </button>
        <view class="row-card static">
          <view class="iconbox">📍</view>
          <view class="row-main">
            <view class="row-title">告警位置</view>
            <view class="row-desc">{{ detail.location }}</view>
          </view>
          <StatusTag label="已定位" />
        </view>
        <view class="row-card static">
          <view class="iconbox warm">⏰</view>
          <view class="row-main">
            <view class="row-title">触发时间</view>
            <view class="row-desc">{{ detail.triggerTime }} · {{ detail.triggerDetail }}</view>
          </view>
          <StatusTag label="5分钟前" tone="warm" />
        </view>
      </view>

      <view class="section-title">
        <view class="h2">响应进度</view>
        <text class="status-text" :class="{ warm: !finished }">{{ progressLabel }}</text>
      </view>
      <view class="section compact-top">
        <AlertTimeline :steps="timelineSteps" />
      </view>

      <view class="section-title">
        <view class="h2">老人当前状态</view>
        <button class="link" @click="goProfile">健康档案 ›</button>
      </view>
      <view class="section compact-top">
        <view class="grid2">
          <button
            v-for="m in detail.liveMetrics"
            :key="m.key"
            class="health-card metric-btn"
          >
            <view class="iconbox" :class="m.iconTone">{{ m.icon }}</view>
            <view class="small-title">{{ m.label }}</view>
            <view class="value">
              <text class="num">{{ m.value }}</text>
              <text v-if="m.unit" class="unit">{{ m.unit }}</text>
            </view>
            <view class="status" :class="m.statusTone">{{ m.status }}</view>
          </button>
        </view>
      </view>

      <view class="section-title">
        <view class="h2">现场定位</view>
      </view>
      <view class="section compact-top">
        <view class="hero gray map-card">
          <view class="map-box">
            <view class="iconbox warm map-pin">📍</view>
            <text class="map-addr">{{ detail.mapAddress }}</text>
            <text class="muted">{{ detail.mapDistance }}</text>
          </view>
          <view class="grid2 action-row">
            <BigButton tone="green" @click="toast('导航前往')">🧭 导航前往</BigButton>
            <BigButton tone="white" @click="toast('上传现场')">📷 上传现场</BigButton>
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
              <view class="batch-title">小鼋处置建议</view>
              <view class="muted">{{ detail.suggestion }}</view>
            </view>
          </view>
          <view class="grid2 action-row">
            <BigButton tone="warm" @click="toast('同步子女')">➤ 同步子女</BigButton>
            <BigButton tone="white" @click="toast('语音记录')">🎙 语音记录</BigButton>
          </view>
        </view>
      </view>

      <view class="section-title">
        <view class="h2">处理结果</view>
      </view>
      <view class="section compact-top">
        <view class="card result-card">
          <view class="result-list">
            <view
              v-for="opt in detail.resultOptions"
              :key="opt.id"
              class="row-card result-opt"
            >
              <view class="iconbox">{{ opt.icon }}</view>
              <view class="row-main">
                <view class="row-title">{{ opt.title }}</view>
                <view class="row-desc">{{ opt.description }}</view>
              </view>
            </view>
          </view>
          <view class="grid2 action-row">
            <BigButton tone="green" @click="handleFinish">✓ 完成工单</BigButton>
            <BigButton tone="white" @click="handleFollowUp">⏳ 继续跟进</BigButton>
          </view>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import BigButton from '@/components/BigButton.vue'
import StatusTag from '@/components/StatusTag.vue'
import YuanMascot from '@/components/YuanMascot.vue'
import AlertTimeline from '@/components/family/AlertTimeline.vue'
import CommunityPageHeader from '@/components/community/CommunityPageHeader.vue'
import StatsHero from '@/components/community/StatsHero.vue'
import { useCommunityAlertStore } from '@/stores/communityAlert'
import type { AlertTimelineStep } from '@/types/family'
import { goMainTab } from '@/utils/navigate'

const alertStore = useCommunityAlertStore()

const detail = computed(() => alertStore.detail)
const finished = computed(() => alertStore.finished)
const progressLabel = computed(() => alertStore.progressLabel)
const heroTone = computed(() => alertStore.heroTone)

const heroMiniStats = computed(() => [
  { label: '优先级', value: detail.value.priority, tone: finished.value ? '' : 'warm' },
  { label: finished.value ? '用时' : '已用时', value: detail.value.elapsedLabel, tone: finished.value ? '' : 'warm' },
  { label: '状态', value: detail.value.statusLabel, tone: finished.value ? '' : 'warm' }
])

const timelineSteps = computed((): AlertTimelineStep[] =>
  detail.value.timeline.map((s) => ({
    id: s.id,
    title: s.title,
    detail: s.detail,
    done: s.done,
    pending: s.pending
  }))
)

onLoad((query) => {
  const id = (query as { id?: string })?.id
  if (id) alertStore.loadById(id)
})

onMounted(() => {
  alertStore.markViewed()
})

function toast(title: string) {
  uni.showToast({ title, icon: 'none' })
}

function handleFinish() {
  alertStore.finish()
  uni.showToast({ title: '工单已闭环', icon: 'success' })
}

function handleFollowUp() {
  alertStore.resetFollowUp()
  uni.showToast({ title: '继续跟进中', icon: 'none' })
}

function goProfile() {
  goMainTab('/pages/community/profile/index')
}
</script>

<style scoped>
.alert-page {
  padding-bottom: 40px;
}

.code-label {
  font-weight: 1000;
}

.status-text {
  font-weight: 1000;
  color: #5b8b62;
}

.status-text.warm {
  color: #c9822c;
}

.static {
  pointer-events: none;
}

.metric-btn {
  text-align: left;
  min-height: 116px;
  border-radius: 24px;
  background: white;
  border: 1px solid #efe3ce;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(63, 52, 29, 0.05);
}

.small-title {
  margin-top: 12px;
  font-size: 15px;
  color: #7a6f5d;
  font-weight: 800;
}

.value {
  margin-top: 4px;
  display: flex;
  align-items: flex-end;
  gap: 4px;
}

.num {
  font-size: 25px;
  font-weight: 1000;
}

.unit {
  font-size: 12px;
  margin-bottom: 2px;
  color: #7a6f5d;
}

.status {
  margin-top: 8px;
  font-size: 14px;
  font-weight: 1000;
  color: #5b8b62;
}

.status.warm {
  color: #c9822c;
}

.map-card {
  padding: 20px;
}

.map-box {
  height: 130px;
  border-radius: 24px;
  background: white;
  border: 1px solid #dce9cf;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.map-box::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.6;
  background: linear-gradient(90deg, #eef3e8 1px, transparent 1px),
    linear-gradient(#eef3e8 1px, transparent 1px);
  background-size: 24px 24px;
}

.map-pin {
  position: relative;
  z-index: 1;
  margin: auto;
}

.map-addr {
  position: relative;
  z-index: 1;
  display: block;
  margin-top: 8px;
  font-weight: 1000;
}

.result-card {
  padding: 16px;
}

.result-opt {
  min-height: 70px;
  background: #fcfaf5;
  margin-bottom: 10px;
}

.result-list {
  margin-bottom: 12px;
}
</style>
