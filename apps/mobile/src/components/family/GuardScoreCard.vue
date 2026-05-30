<template>
  <view class="hero green score-card">
    <view class="between row-top">
      <view class="main">
        <HeroTitle :pill="pillLabel" :title="headline" :clamp="2" />
        <view class="muted sync-row">
          <text class="text-nowrap">最近同步：{{ lastSyncLabel }}</text>
          <text> · </text>
          <text class="text-nowrap">{{ activityLabel }}</text>
        </view>
      </view>
      <view class="score-ring">
        <text class="score-num">{{ guardScore }}</text>
        <text class="score-label">守护分</text>
      </view>
    </view>
    <view class="grid3 stats">
      <view class="card stat-card">
        <text class="muted text-nowrap">设备在线</text>
        <text class="stat-num text-nowrap">{{ deviceCount }} 台</text>
      </view>
      <view class="card stat-card">
        <text class="muted text-nowrap">风险提醒</text>
        <text class="stat-num warm text-nowrap">{{ riskCount }} 条</text>
      </view>
      <view class="card stat-card">
        <text class="muted text-nowrap">服药完成</text>
        <text class="stat-num text-nowrap">{{ medicineDonePercent }}%</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import HeroTitle from '@/components/HeroTitle.vue'

withDefaults(defineProps<{
  pillLabel?: string
  headline: string
  lastSyncLabel: string
  activityLabel: string
  guardScore: number
  deviceCount: number
  riskCount: number
  medicineDonePercent: number
}>(), {
  pillLabel: '🛡️ 当前安全'
})
</script>

<style scoped lang="scss">
.score-card {
  padding: 20px;
}

.main {
  flex: 1;
  min-width: 0;
}

.sync-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0;
  font-size: 13px;
  margin-top: 6px;
}

.score-ring {
  width: 88px;
  height: 88px;
  border-radius: 28px;
  background: #fff;
  border: 1px solid #d6e8d4;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.score-num {
  font-size: 28px;
  font-weight: 1000;
  color: #315943;
  line-height: 1;
}

.score-label {
  margin-top: 4px;
  font-size: 12px;
  font-weight: 1000;
  color: #7a6f5d;
}

.stats {
  margin-top: 16px;
}

.stat-card {
  padding: 12px;
  text-align: center;
}

.stat-num {
  display: block;
  margin-top: 6px;
  font-size: 20px;
  font-weight: 1000;
  color: #243a31;
}

.stat-num.warm {
  color: #c9822c;
}
</style>
