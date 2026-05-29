<template>
  <view class="app-page">
    <AppHeader label="我的身体" title="血压详情" back="/pages/health/index" compact />
    <view class="section">
      <view class="hero warm">
        <view class="between row-top">
          <view>
            <view class="pill warn-pill">轻微偏高</view>
            <view class="bp-value">128/82 <text class="bp-unit">mmHg</text></view>
            <view class="muted bp-copy">比平时略高一点，不用紧张。建议今晚少盐、慢走，并在睡前再测一次。</view>
          </view>
          <view class="iconbox warm bp-icon">压</view>
        </view>
        <view class="grid2 bp-cards">
          <view class="card bp-card"><view class="muted">收缩压</view><view class="bp-num">128</view><view class="status warning">略高</view></view>
          <view class="card bp-card"><view class="muted">舒张压</view><view class="bp-num">82</view><view class="status">正常</view></view>
        </view>
      </view>
    </view>
    <view class="section">
      <view class="grid2">
        <BigButton @click="health.playVoiceSummary('小鼋提醒：今天血压略高，建议睡前复测。')">语音播报</BigButton>
        <BigButton tone="white" @click="go('/pkg-elder-detail/family/index')">告知家人</BigButton>
      </view>
      <view v-if="health.voiceMessage" class="card feedback">{{ health.voiceMessage }}</view>
    </view>
    <view class="section-title">
      <view class="h2">近 7 天趋势</view>
      <button class="link" @click="go('/pkg-elder-detail/health-report/index')">全部记录 ›</button>
    </view>
    <view class="section compact">
      <view class="card chart-card">
        <view class="chart">
          <view class="line orange"></view>
          <view class="line greenline"></view>
        </view>
        <view class="between muted legend"><text>收缩压</text><text>舒张压</text></view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import BigButton from '@/components/BigButton.vue'
import { useHealthStore } from '@/stores/health'
import { goDetail } from '@/utils/navigate'

const health = useHealthStore()

function go(url: string) {
  goDetail(url)
}
</script>

<style scoped>
.warn-pill {
  color: #c9822c;
}

.bp-value {
  margin-top: 16px;
  font-size: 44px;
  font-weight: 900;
  color: #243a31;
}

.bp-unit {
  font-size: 14px;
  color: #7a6f5d;
}

.bp-copy {
  line-height: 1.5;
}

.bp-icon {
  width: 84px;
  height: 84px;
  border-radius: 28px;
  font-size: 34px;
  font-weight: 900;
}

.bp-cards {
  margin-top: 16px;
}

.bp-card {
  padding: 13px;
  border-color: #f0d8a8;
}

.bp-num {
  margin-top: 4px;
  font-size: 28px;
  font-weight: 900;
}

.feedback {
  margin-top: 12px;
  padding: 12px 14px;
  color: #315943;
  font-weight: 900;
}

.compact {
  margin-top: 0;
}

.chart-card {
  padding: 16px;
}

.chart {
  position: relative;
  height: 132px;
  overflow: hidden;
}

.line {
  position: absolute;
  left: 8px;
  right: 8px;
  height: 4px;
  border-radius: 99px;
}

.orange {
  top: 46px;
  background: linear-gradient(100deg, #c9822c, #e8a64e);
  transform: skewY(-7deg);
}

.greenline {
  top: 82px;
  background: #7ab66b;
  transform: skewY(-3deg);
}

.legend {
  font-size: 13px;
  font-weight: 900;
}
</style>
