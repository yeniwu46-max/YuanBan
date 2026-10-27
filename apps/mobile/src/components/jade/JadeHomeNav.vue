<template>
  <view class="jade-nav" role="navigation" aria-label="主要导航">
    <JadeButton v-for="tab in tabs" :key="tab.key" class="jade-nav__item" :class="{ 'jade-nav__item--active': tab.key === active }" :aria-current="tab.key === active ? 'page' : undefined" @click="goMainTab(tab.path)">
      <image v-if="tab.key === 'companion'" :src="mascot" class="jade-nav__mascot" mode="aspectFit" alt="" />
      <JadeIcon v-else :name="tab.icon" />
      <text>{{ tab.label }}</text>
    </JadeButton>
  </view>
</template>

<script setup lang="ts">
import JadeButton from '@/components/jade/JadeButton.vue'
import JadeIcon from './JadeIcon.vue'
import { mascotPortrait as mascot } from '@/config/mascot'
import { goMainTab } from '@/utils/navigate'
withDefaults(defineProps<{ active?: string }>(), { active: 'home' })
const tabs = [
  { key: 'home', label: '首页', icon: 'home', path: '/pages/home/index' },
  { key: 'health', label: '健康', icon: 'heart', path: '/pages/health/index' },
  { key: 'companion', label: '小鼋', icon: 'leaf', path: '/pages/companion/index' },
  { key: 'service', label: '服务', icon: 'grid', path: '/pages/service/index' }
] as const
</script>

<style scoped>
.jade-nav { position: fixed; z-index: 110; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 540px; box-sizing: border-box; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); padding: 12px 16px calc(12px + env(safe-area-inset-bottom)); border-top: 1px solid #e3ece7; background: #fff; }
.jade-nav__item { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 54px; gap: 5px; border-radius: 16px; font-size: 14px; line-height: 1.2; color: #6d8178; }
.jade-nav__item--active { color: #126a4f; background: #edf7f1; font-weight: 700; }
.jade-nav__mascot { width: 28px; height: 28px; }
.jade-nav__item:focus-visible { outline: 3px solid #176e53; outline-offset: -3px; }
</style>
