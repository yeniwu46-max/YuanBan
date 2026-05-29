<template>
  <view v-if="session.isElder" class="bottom-nav">
    <view class="navgrid elder">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="navitem"
        :class="{ active: activeKey === tab.key, center: tab.key === 'companion' }"
        @click="switchTab(tab)"
      >
        <view v-if="tab.key === 'companion'" class="navyuan">鼋</view>
        <view v-else class="navicon">{{ tabIcons[tab.key] }}</view>
        <text>{{ tab.label }}</text>
      </button>
    </view>
  </view>
  <view v-else-if="session.isFamily" class="bottom-nav">
    <view class="navgrid">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="navitem"
        :class="{ active: activeKey === tab.key }"
        @click="switchTab(tab)"
      >
        <view class="navicon">{{ familyIcons[tab.key] }}</view>
        <text>{{ tab.label }}</text>
      </button>
    </view>
  </view>
  <view v-else class="bottom-nav community">
    <view class="navgrid">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="navitem"
        :class="{ active: activeKey === tab.key }"
        @click="switchTab(tab)"
      >
        <view class="navicon">{{ communityIcons[tab.key] }}</view>
        <text>{{ tab.label }}</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useSessionStore } from '@/stores/session'
import { getCurrentRoute, goMainTab } from '@/utils/navigate'
import { getTabsForRole, resolveContentPath, type TabItem } from '@/utils/tabBar'

const session = useSessionStore()
const tabs = computed(() => getTabsForRole(session.role))

const tabIcons: Record<string, string> = { home: '首', health: '健', companion: '鼋', service: '服' }
const familyIcons: Record<string, string> = { guardian: '⌂', report: '▤', care: '♡', settings: '⚙' }
const communityIcons: Record<string, string> = { dashboard: '⌂', workorders: '▤', activity: '📅', profile: '👤' }

const activeKey = computed(() => {
  const route = getCurrentRoute()
  const content = resolveContentPath(route, session.role)
  return tabs.value.find((t) => t.contentPath === content || t.shellPath === route)?.key ?? tabs.value[0]?.key
})

function switchTab(tab: TabItem) {
  goMainTab(tab.shellPath)
}

onShow(() => {
  const tabBar = typeof getCurrentPages !== 'undefined' ? (getCurrentPages()[0] as { getTabBar?: () => { setData: (d: object) => void } }) : null
  tabBar?.getTabBar?.()?.setData({ selected: activeKey.value })
})
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
  background: transparent;
  border: none;
  padding: 0;
}

.navicon,
.navyuan {
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

.navitem.active .navicon,
.navitem.active .navyuan {
  background: #e6f2df;
}

.navitem.center .navyuan {
  background: #416348;
  color: #fff;
  font-weight: 1000;
}

@media (min-width: 520px) {
  .bottom-nav {
    left: 50%;
    width: 390px;
    transform: translateX(-50%);
  }
}
</style>
