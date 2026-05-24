<template>
  <view class="bottom-nav">
    <view class="navgrid">
      <button class="navitem" :class="{ active: active === 'home' }" @click="go('/pages/home/index')">
        <view class="navicon">⌂</view>
        <text>首页</text>
      </button>
      <button class="navitem" :class="{ active: active === 'health' }" @click="go('/pages/health/index')">
        <view class="navicon">♡</view>
        <text>健康</text>
      </button>
      <button class="navcenter" @click="go('/pages/companion/index')">
        <view class="navyuan">鼋</view>
        <text>小鼋</text>
      </button>
      <button class="navitem" :class="{ active: active === 'service' }" @click="go('/pages/service/index')">
        <view class="navicon">▣</view>
        <text>服务</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { goMainTab } from '@/utils/navigate'

defineProps<{ active?: 'home' | 'health' | 'companion' | 'service' }>()

function go(url: string) {
  goMainTab(url)
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

.navcenter {
  margin-top: -31px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  color: #416348;
  font-size: 13px;
  font-weight: 900;
}

.navyuan {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: #7ab66b;
  border: 6px solid #fffdf7;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 900;
  box-shadow: 0 6px 16px rgba(63, 80, 49, 0.18);
}

@media (min-width: 520px) {
  .bottom-nav {
    left: 50%;
    width: 390px;
    transform: translateX(-50%);
  }
}
</style>

