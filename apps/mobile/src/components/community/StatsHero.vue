<template>
  <view class="hero" :class="tone">
    <view class="between row-top">
      <view class="main">
        <view class="pill">{{ pill }}</view>
        <view class="hero-title">{{ headline }}</view>
        <view v-if="subtitle" class="muted hero-desc">{{ subtitle }}</view>
      </view>
      <view v-if="badgeValue != null && badgeValue !== ''" class="badge">
        <text class="badge-num">{{ badgeValue }}</text>
        <text class="badge-label">{{ badgeLabel }}</text>
      </view>
      <view v-else-if="badgeIcon" class="iconbox large-badge" :class="badgeTone">{{ badgeIcon }}</view>
    </view>
    <view v-if="stats.length" class="stat-grid" :class="gridClass">
      <view v-for="item in stats" :key="item.label" class="card stat-mini">
        <text class="muted">{{ item.label }}</text>
        <text class="stat-num" :class="item.tone">{{ item.value }}</text>
      </view>
    </view>
    <slot />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
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
}>(), {
  tone: 'green',
  stats: () => [],
  gridCols: 4
})

const gridClass = computed(() => (props.gridCols === 3 ? 'cols3' : 'cols4'))
</script>

<style scoped lang="scss">
.hero-title {
  margin-top: 15px;
  font-size: 24px;
  line-height: 1.35;
  font-weight: 1000;
}

.hero-desc {
  margin-top: 8px;
  line-height: 1.5;
}

.badge {
  width: 88px;
  height: 88px;
  border-radius: 28px;
  background: white;
  border: 1px solid #d6e8d4;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  flex-shrink: 0;
}

.badge-num {
  font-size: 28px;
  color: #315943;
  font-weight: 1000;
}

.badge-label {
  font-size: 12px;
  font-weight: 1000;
  color: #7a6f5d;
}

.large-badge {
  width: 88px;
  height: 88px;
  border-radius: 28px;
  font-size: 42px;
}

.stat-grid {
  display: grid;
  gap: 12px;
  margin-top: 16px;
}

.stat-grid.cols4 {
  grid-template-columns: repeat(4, 1fr);
}

.stat-grid.cols3 {
  grid-template-columns: repeat(3, 1fr);
}

.stat-mini {
  padding: 8px 10px;
  text-align: center;
}

.stat-num {
  display: block;
  margin-top: 4px;
  font-size: 21px;
  font-weight: 1000;
  color: #243a31;
}

.stat-num.warm {
  color: #c9822c;
}

.stat-num.red {
  color: #e56b5f;
}
</style>
