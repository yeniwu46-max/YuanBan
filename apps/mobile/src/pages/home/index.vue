<template>
  <view class="app-page">
    <AppHeader :label="`早上好，${elder.profile.name}`" title="今天一切安好" />
    <view class="section hero-enter">
      <view class="hero green">
        <view class="between row-top">
          <view class="hero-main">
            <view class="pill">安全守护中</view>
            <view class="hero-copy text-balance">小鼋正在陪着您，家人也能安心看到您的状态。</view>
            <view class="muted hero-desc text-nowrap">设备在线 · 心率正常 · 环境正常</view>
          </view>
          <YuanMascot heart />
        </view>
        <view class="grid2 action-row">
          <BigButton tone="red" @click="go('/pkg-elder-detail/sos/index')">SOS 求助</BigButton>
          <BigButton tone="white" @click="health.playVoiceSummary('小鼋正在为您播报今天的健康情况')">语音唤醒</BigButton>
        </view>
        <view v-if="health.voiceMessage" class="card feedback">{{ health.voiceMessage }}</view>
      </view>
    </view>

    <view class="section">
      <button class="card message-card" @click="go('/pages/companion/index')">
        <view class="row">
          <view class="iconbox">语</view>
          <view class="item-main">
            <view class="msg-title">小鼋想和您说</view>
            <view class="muted msg-copy">今天记得喝水，晚饭后可以散步 15 分钟。</view>
          </view>
          <text class="chev">›</text>
        </view>
      </button>
    </view>

    <view class="section-title">
      <view class="h2">今日健康</view>
      <button class="link" @click="go('/pkg-elder-detail/health-report/index')">查看报告 ›</button>
    </view>
    <view class="section compact">
      <view class="grid2">
        <HealthMetricCard :metric="metric('heartRate')" icon="心" @click="openMetric('heartRate')" />
        <HealthMetricCard :metric="metric('breathRate')" icon="息" @click="openMetric('breathRate')" />
        <HealthMetricCard :metric="metric('medicine')" icon="药" @click="go('/pkg-elder-detail/medicine/index')" />
        <HealthMetricCard :metric="metric('sleep')" icon="眠" @click="openMetric('sleep')" />
      </view>
    </view>

    <view class="section">
      <view class="hero warm contact-card">
        <view class="between contact-head">
          <view class="h2 contact-title">联系家人</view>
          <view class="muted contact-sub">{{ elder.onlineContactCount }} 位家人在线</view>
        </view>
        <view class="grid3">
          <BigButton
            v-for="contact in elder.profile.emergencyContacts"
            :key="contact.id"
            tone="white"
            class="family-btn"
            @click="go(`/pkg-elder-detail/contact-detail/index?id=${contact.id}`)"
          >
            <text>{{ contact.relation }}</text>
            <text class="family-status">{{ contact.onlineStatus === 'online' ? '在线' : contact.onlineStatus === 'busy' ? '忙碌' : '离线' }}</text>
          </BigButton>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import AppHeader from '@/components/AppHeader.vue'
import BigButton from '@/components/BigButton.vue'
import HealthMetricCard from '@/components/HealthMetricCard.vue'
import YuanMascot from '@/components/YuanMascot.vue'
import { useElderContext } from '@/composables/useElderContext'
import { refreshInBackground } from '@/services/prefetch'
import { useElderStore } from '@/stores/elder'
import { useHealthStore } from '@/stores/health'
import { goDetail } from '@/utils/navigate'
import type { HealthMetric } from '@/types/elder'

const elder = useElderStore()
const health = useHealthStore()
const { elderId } = useElderContext()

onShow(() => {
  refreshInBackground(async () => {
    await Promise.all([
      elder.hydrate(elderId.value, { force: true }),
      health.hydrate(elderId.value, { force: true })
    ])
  })
})

function metric(key: string): HealthMetric {
  return health.metricByKey(key) ?? health.metrics[0]
}

function openMetric(key: HealthMetric['key']) {
  go(`/pkg-elder-detail/health-metric/index?key=${key}`)
}

function go(url: string) {
  goDetail(url)
}
</script>

<style scoped>
.hero-main {
  flex: 1;
}

.hero-copy {
  margin-top: 15px;
  font-size: 21px;
  line-height: 1.35;
  font-weight: 900;
  color: #243a31;
}

.hero-desc {
  margin-top: 8px;
}

.action-row {
  margin-top: 18px;
}

.feedback {
  margin-top: 12px;
  padding: 12px 14px;
  color: #315943;
  font-weight: 900;
}

.message-card {
  width: 100%;
  padding: 16px;
  text-align: left;
}

.msg-title {
  font-size: 18px;
  font-weight: 900;
}

.msg-copy {
  font-size: 14px;
  margin-top: 3px;
}

.compact {
  margin-top: 0;
}

.contact-card {
  padding: 16px;
  border-radius: 28px;
}

.contact-head {
  margin-bottom: 12px;
}

.contact-title {
  font-size: 20px;
}

.contact-sub {
  font-size: 14px;
}

.family-btn :deep(.btn-root),
.family-btn {
  min-height: 72px;
  font-size: 16px;
  flex-direction: column;
}

.family-status {
  font-size: 12px;
  color: #7a6f5d;
  white-space: nowrap;
}
</style>
