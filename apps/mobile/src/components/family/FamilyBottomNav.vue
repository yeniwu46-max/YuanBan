<template>
  <view class="bottom-nav">
    <view class="navgrid">
      <button class="navitem" :class="{ active: active === 'guardian' }" @click="go('guardian')">
        <view class="navicon">⌂</view>
        <text>守护</text>
      </button>
      <button class="navitem" :class="{ active: active === 'report' }" @click="go('report')">
        <view class="navicon">▤</view>
        <text>报告</text>
      </button>
      <button class="navitem" :class="{ active: active === 'care' }" @click="go('care')">
        <view class="navicon">♡</view>
        <text>关怀</text>
      </button>
      <button class="navitem" :class="{ active: active === 'settings' }" @click="go('settings')">
        <view class="navicon">⚙</view>
        <text>设置</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { goMainTab } from '@/utils/navigate'

defineProps<{
  active: 'guardian' | 'report' | 'care' | 'settings'
}>()

const tabRoutes = {
  guardian: '/pages/family/guardian/index',
  report: '/pages/family/report/index',
  care: '/pages/family/care/index',
  settings: '/pages/family/settings/index'
} as const

function go(tab: keyof typeof tabRoutes) {
  goMainTab(tabRoutes[tab])
}
</script>

<style scoped lang="scss">
.bottom-nav {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: calc(98px + env(safe-area-inset-bottom));
  background: rgba(255, 253, 247, 0.96);
  backdrop-filter: blur(12px);
  border-top: 1px solid #efe7d8;
  border-radius: 34px 34px 0 0;
  padding: 12px 28px 0;
  z-index: 100;
  pointer-events: auto;
}

.navgrid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  align-items: start;
  text-align: center;
  color: #9a927f;
}

.navitem {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 900;
  color: #9a927f;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.navicon {
  width: 44px;
  height: 44px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.navitem.active {
  color: #416348;
}

.navitem.active .navicon {
  background: #e6f2df;
}

@media (min-width: 520px) {
  .bottom-nav {
    left: 50%;
    width: 390px;
    transform: translateX(-50%);
  }
}
</style>
