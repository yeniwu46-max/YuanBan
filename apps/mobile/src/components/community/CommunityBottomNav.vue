<template>
  <view class="bottom-nav">
    <view class="navgrid">
      <button class="navitem" :class="{ active: active === 'dashboard' }" @click="go('dashboard')">
        <view class="navicon">⌂</view>
        <text>看板</text>
      </button>
      <button class="navitem" :class="{ active: active === 'workorders' }" @click="go('workorders')">
        <view class="navicon">▤</view>
        <text>工单</text>
      </button>
      <button class="navitem" :class="{ active: active === 'activity' }" @click="go('activity')">
        <view class="navicon">📅</view>
        <text>活动</text>
      </button>
      <button class="navitem" :class="{ active: active === 'profile' }" @click="go('profile')">
        <view class="navicon">👤</view>
        <text>档案</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { goMainTab } from '@/utils/navigate'

defineProps<{
  active: 'dashboard' | 'workorders' | 'activity' | 'profile'
}>()

const tabRoutes = {
  dashboard: '/pages/community/dashboard/index',
  workorders: '/pages/community/workorders/index',
  activity: '/pages/community/activity/index',
  profile: '/pages/community/profile/index'
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
  background: rgba(252, 250, 245, 0.96);
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
  text-align: center;
  color: #9a927f;
}

.navitem {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 1000;
  color: inherit;
}

.navitem.active {
  color: #416348;
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

.navitem.active .navicon {
  background: #e6f2df;
}
</style>
