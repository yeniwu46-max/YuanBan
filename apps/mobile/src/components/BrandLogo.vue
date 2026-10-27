<template>
  <view class="brand-logo" :class="`brand-logo--${size}`">
    <image class="brand-logo__image" :src="logo" mode="aspectFit" :alt="alt" />
  </view>
</template>

<script setup lang="ts">
import { mascotPortrait as logo } from '@/config/mascot'

withDefaults(defineProps<{
  size?: 'sm' | 'md' | 'lg'
  alt?: string
}>(), {
  size: 'md',
  alt: '鼋伴伴小鼋品牌头像'
})
</script>

<style scoped lang="scss">
.brand-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  overflow: hidden;
  border: 1px solid var(--line);
  background: var(--green-soft);
  border-radius: 18px;
}

.brand-logo--sm { width: 42px; height: 42px; border-radius: 14px; }
.brand-logo--md { width: 60px; height: 60px; border-radius: 20px; }
.brand-logo--lg { width: 116px; height: 116px; border-radius: 32px; }

.brand-logo__image {
  width: 100%;
  height: 100%;
}
</style>
