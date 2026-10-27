<script setup lang="ts">
withDefaults(
  defineProps<{
    tone?: 'green' | 'warm' | 'red' | 'gray'
    pill: string
    headline: string
    subtitle?: string
    badgeValue?: string | number
    badgeLabel?: string
    badgeIcon?: string
    badgeTone?: string
    stats?: { label: string; value: string | number; tone?: string }[]
    gridCols?: 3 | 4
  }>(),
  { tone: 'green', stats: () => [], gridCols: 4 },
)
const clean = (text: string) => text.replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, '').trim()
</script>
<template>
  <view class="hero stats-hero" :class="tone">
    <view class="stats-heading">
      <view class="item-main">
        <view class="stats-eyebrow">{{ clean(pill) }}</view>
        <view class="hero-title">{{ headline }}</view>
        <view v-if="subtitle" class="stats-copy">{{ subtitle }}</view>
      </view>
      <view v-if="badgeValue != null && badgeValue !== ''" class="stats-badge">
        <text>{{ badgeValue }}</text>
        <view>{{ badgeLabel }}</view>
      </view>
      <AppIcon v-else-if="badgeIcon" :name="badgeIcon" :size="40" />
    </view>
    <view
      v-if="stats.length"
      class="stats-strip"
      :style="{ gridTemplateColumns: 'repeat(' + gridCols + ', minmax(0,1fr))' }"
    >
      <view v-for="item in stats" :key="item.label">
        <text>{{ item.value }}</text>
        <view>{{ item.label }}</view>
      </view>
    </view>
    <slot />
  </view>
</template>
<style scoped>
.stats-heading {
  display: flex;
  align-items: center;
  gap: 24px;
}
.stats-eyebrow {
  font-size: 14px;
  margin-bottom: 14px;
  opacity: 0.85;
}
.stats-copy {
  font-size: 16px;
  margin-top: 12px;
  opacity: 0.85;
}
.stats-badge {
  font-size: 14px;
  text-align: center;
  flex-shrink: 0;
}
.stats-badge > text {
  font-size: 52px;
  line-height: 1.1;
  letter-spacing: -0.05em;
}
.stats-strip {
  display: grid;
  gap: 16px;
  padding-top: 20px;
  margin-top: 24px;
  border-top: 1px solid #ffffff30;
  font-size: 14px;
}
.stats-strip text {
  font-size: 32px;
  letter-spacing: -0.03em;
}
.green .stats-copy,
.green .stats-eyebrow,
.green .stats-strip > view > view,
.green .stats-badge > view {
  color: var(--hero-ink);
}
@media (max-width: 767px) {
  .stats-heading {
    gap: 16px;
    align-items: flex-start;
  }
  .stats-badge > text {
    font-size: 40px;
  }
  .stats-strip {
    gap: 8px;
  }
  .stats-strip text {
    font-size: 28px;
  }
  .stats-hero :deep(.hero-title) {
    font-size: 24px;
  }
}
</style>
