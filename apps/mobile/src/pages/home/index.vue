<template>
  <view class="app-page">
    <AppHeader :label="`早上好，${elder.profile.name}`" title="今天一切安好" />
    <view class="section">
      <view class="hero green">
        <view class="between row-top">
          <view class="hero-main">
            <view class="pill">🛡️ 安全守护中</view>
            <view class="hero-copy">小鼋正在陪着您，家人也能安心看到您的状态。</view>
            <view class="muted hero-desc">设备在线 · 心率正常 · 环境正常</view>
          </view>
          <YuanMascot heart />
        </view>
        <view class="grid2 action-row">
          <BigButton tone="red" @click="go('/pages/sos/index')">☎ SOS 求助</BigButton>
          <BigButton tone="white">🎙 语音唤醒</BigButton>
        </view>
      </view>
    </view>
    <view class="section">
      <view class="card message-card">
        <view class="row">
          <view class="iconbox">💬</view>
          <view class="item-main">
            <view class="msg-title">小鼋想和您说</view>
            <view class="muted msg-copy">今天记得喝水，晚饭后可以散步 15 分钟。</view>
          </view>
          <text class="chev">›</text>
        </view>
      </view>
    </view>
    <view class="section-title">
      <view class="h2">今日健康</view>
      <button class="link" @click="go('/pages/health-report/index')">查看报告 ›</button>
    </view>
    <view class="section compact">
      <view class="grid2">
        <HealthMetricCard :metric="metric('heartRate')" icon="❤️" @click="go('/pages/health/index')" />
        <HealthMetricCard :metric="metric('breathRate')" icon="🌬️" />
        <HealthMetricCard :metric="metric('medicine')" icon="💊" @click="go('/pages/medicine/index')" />
        <HealthMetricCard :metric="metric('sleep')" icon="🌙" />
      </view>
    </view>
    <view class="section">
      <view class="hero warm contact-card">
        <view class="between contact-head">
          <view class="h2 contact-title">联系家人</view>
          <view class="muted contact-sub">{{ elder.onlineContactCount }} 位家人在线</view>
        </view>
        <view class="grid3">
          <button v-for="contact in elder.profile.emergencyContacts" :key="contact.id" class="bigbtn btnwhite family-btn" @click="go('/pages/family/index')">
            <text>{{ contact.relation === '女儿' ? '📹' : '☎' }}</text>
            <text>{{ contact.relation }}</text>
          </button>
        </view>
      </view>
    </view>
    <BottomNav active="home" />
  </view>
</template>

<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import BigButton from '@/components/BigButton.vue'
import BottomNav from '@/components/BottomNav.vue'
import HealthMetricCard from '@/components/HealthMetricCard.vue'
import YuanMascot from '@/components/YuanMascot.vue'
import { useElderStore } from '@/stores/elder'
import { useHealthStore } from '@/stores/health'
import type { HealthMetric } from '@/types/elder'

const elder = useElderStore()
const health = useHealthStore()

function metric(key: string): HealthMetric {
  return health.metricByKey(key) ?? health.metrics[0]
}

function go(url: string) {
  uni.redirectTo({ url })
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

.message-card {
  padding: 16px;
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

.family-btn {
  min-height: 72px;
  font-size: 16px;
  flex-direction: column;
}
</style>

