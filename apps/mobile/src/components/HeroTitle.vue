<template>
  <view class="hero-title-wrap">
    <view v-if="pill" class="pill hero-pill" :class="pillClass">{{ pill }}</view>
    <view
      class="hero-title"
      :class="{
        'hero-title--nowrap': nowrap,
        'hero-title--clamp1': !nowrap && clamp === 1,
        'hero-title--clamp2': !nowrap && clamp === 2,
      }"
    >{{ title }}</view>
    <view v-if="subtitle" class="muted hero-desc">{{ subtitle }}</view>
  </view>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  subtitle?: string
  pill?: string
  /** pill 上额外追加的 class（如 red-pill、warm-pill） */
  pillClass?: string
  /** 单行强制 nowrap + ellipsis（告警标题等） */
  nowrap?: boolean
  /** 最多行数，默认 2；nowrap=true 时忽略 */
  clamp?: 1 | 2
}>(), {
  nowrap: false,
  clamp: 2,
})
</script>

<style scoped lang="scss">
.hero-pill {
  // pill 已由全局样式处理，这里只补上 hero 区域的 margin
  display: inline-flex;
}

.hero-title {
  margin-top: 15px;
  font-size: 24px;
  font-weight: 1000;
  color: #243a31;
  line-height: 1.25;
  letter-spacing: -0.02em;
}

.hero-title--nowrap {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hero-title--clamp1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hero-title--clamp2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hero-desc {
  margin-top: 8px;
  line-height: 1.5;
  word-break: keep-all;
  overflow-wrap: break-word;
}
</style>
