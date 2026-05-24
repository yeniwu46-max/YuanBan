<template>
  <view class="skeleton-wrap">
    <view class="hero green skeleton-hero">
      <view class="sk-line sk-pill" />
      <view class="sk-line sk-title" />
      <view class="sk-line sk-desc" />
      <view class="grid3 sk-stats">
        <view v-for="n in 3" :key="n" class="card sk-stat" />
      </view>
    </view>
    <view class="sk-section-title" />
    <view class="grid4 sk-quick">
      <view v-for="n in 4" :key="n" class="sk-quick-item" />
    </view>
    <view class="sk-section-title" />
    <view class="list flush sk-list">
      <view v-for="n in 2" :key="n" class="item sk-row" />
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  blocks?: number
}>()
</script>

<style scoped lang="scss">
.skeleton-wrap {
  padding: 0 24px;
}

.skeleton-hero {
  padding: 20px;
  margin-top: 16px;
}

.sk-line,
.sk-stat,
.sk-quick-item,
.sk-row,
.sk-section-title {
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.35) 25%, rgba(255, 255, 255, 0.75) 50%, rgba(255, 255, 255, 0.35) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite;
  border-radius: 12px;
}

.sk-pill {
  width: 120px;
  height: 28px;
  border-radius: 999px;
}

.sk-title {
  width: 88%;
  height: 24px;
  margin-top: 16px;
}

.sk-desc {
  width: 72%;
  height: 16px;
  margin-top: 10px;
}

.sk-stats {
  margin-top: 16px;
}

.sk-stat {
  height: 64px;
}

.sk-section-title {
  height: 22px;
  width: 120px;
  margin: 20px 0 12px;
}

.sk-quick {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.sk-quick-item {
  height: 92px;
  border-radius: 24px;
}

.sk-list {
  padding: 0;
}

.sk-row {
  min-height: 82px;
  margin-bottom: 12px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
