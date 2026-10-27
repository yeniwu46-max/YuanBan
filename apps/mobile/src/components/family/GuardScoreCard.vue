<script setup lang="ts">
withDefaults(
  defineProps<{
    pillLabel?: string
    headline: string
    lastSyncLabel: string
    activityLabel: string
    guardScore: number
    deviceCount: number
    riskCount: number
    medicineDonePercent: number
  }>(),
  { pillLabel: '当前守护状态' },
)
</script>
<template>
  <view class="hero green guard-hero">
    <view class="guard-heading">
      <view class="item-main">
        <view class="guard-eyebrow">
          <AppIcon name="shield" :size="18" />
          守护摘要
        </view>
        <view class="hero-title">
          {{ riskCount ? riskCount + ' 项需关注' : headline }}
        </view>
        <view class="guard-copy">
          最近同步 {{ lastSyncLabel }}

        </view>
      </view>
      <view class="guard-score">
        <text>{{ guardScore }}</text>
        <view>守护分</view>
      </view>
    </view>
    <view class="guard-stats">
      <view>
        <text>
          {{ deviceCount }}
          <small>台</small>
        </text>
        <view>设备在线</view>
      </view>
      <view>
        <text>
          {{ riskCount }}
          <small>条</small>
        </text>
        <view>风险提醒</view>
      </view>
      <view>
        <text>
          {{ medicineDonePercent }}
          <small>%</small>
        </text>
        <view>服药完成</view>
      </view>
    </view>
  </view>
</template>
<style scoped>
.guard-heading {
  display: flex;
  gap: 20px;
  align-items: center;
}
.guard-eyebrow {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--hero-ink);
  margin-bottom: 16px;
}
.guard-copy {
  margin-top: 12px;
  color: var(--hero-ink);
  font-size: 16px;
  line-height: 1.7;
}
.guard-score {
  text-align: center;
  flex-shrink: 0;
  font-size: 14px;
  color: var(--hero-ink);
}
.guard-score > text {
  font-size: 56px;
  line-height: 1.1;
  letter-spacing: -0.06em;
  color: white;
}
.guard-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  padding-top: 20px;
  margin-top: 24px;
  border-top: 1px solid #ffffff26;
  font-size: 14px;
  color: var(--hero-ink);
}
.guard-stats text {
  font-size: 30px;
  color: white;
  letter-spacing: -0.03em;
}
.guard-stats small {
  font-size: 14px;
  letter-spacing: 0;
}
@media (max-width: 359px) {
  .guard-heading {
    gap: 12px;
  }
  .guard-score > text {
    font-size: 44px;
  }
  .guard-stats {
    gap: 10px;
  }
  .guard-stats text {
    font-size: 26px;
  }
}
</style>
