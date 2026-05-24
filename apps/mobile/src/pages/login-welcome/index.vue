<template>
  <view class="app-page login-page welcome">
    <view class="section welcome-inner">
      <view class="between">
        <view>
          <view class="label">智慧养老陪伴系统</view>
          <view class="h1 brand">鼋伴伴</view>
        </view>
        <StatusTag label="老人端" />
      </view>
      <view class="mascot-line">
        <YuanMascot size="xlarge" heart />
      </view>
      <view class="center">
        <view class="h1 welcome-title">让守护更安心，<br />让陪伴更有温度。</view>
        <view class="muted welcome-copy">小鼋会陪着您，也会在需要时通知家人和社区。</view>
      </view>
      <view class="grid3 feature-grid">
        <view class="quick center mini">🛡️<view class="quick-title">安全守护</view></view>
        <view class="quick center mini">💚<view class="quick-title">亲情陪伴</view></view>
        <view class="quick center mini">🎙<view class="quick-title">语音优先</view></view>
      </view>
      <BigButton class="start" @click="go('/pages/login-role/index')">开始使用 ›</BigButton>
    </view>
  </view>
</template>

<script setup lang="ts">
import BigButton from '@/components/BigButton.vue'
import StatusTag from '@/components/StatusTag.vue'
import YuanMascot from '@/components/YuanMascot.vue'
import { goReplace } from '@/utils/navigate'

function go(url: string) {
  goReplace(url)
}
</script>

<style scoped lang="scss">
.welcome-inner {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-top: 48px;
  padding-bottom: 30px;
}

.brand {
  font-size: 34px;
  margin-top: 8px;
}

.mascot-line {
  margin-top: 42px;
  display: flex;
  justify-content: center;
}

.welcome-title {
  margin-top: 34px;
  font-size: 30px;
  line-height: 1.25;
}

.welcome-copy {
  margin-top: 14px;
  font-size: 16px;
  line-height: 1.65;
}

.feature-grid {
  margin-top: 24px;
}

.mini {
  min-height: 88px;
  padding: 14px;
}

.start {
  margin-top: 22px;
  border-radius: 28px;
}
</style>
