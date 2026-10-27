<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useSessionStore } from '@/stores/session'
import { getTabsForRole } from '@/utils/tabBar'
import { getCurrentRoute } from '@/utils/navigate'
import RoleNavigation from './RoleNavigation.vue'
import { useApiMode } from '@/config/apiMode'
import { requestStatus } from '@/services/requestStatus'
import AppSheet from './AppSheet.vue'
const props = defineProps<{ dataSource?: 'api' | 'mock' | 'unknown' }>()
const showDataInfo = ref(false)
const isDemo = computed(() => !useApiMode() || props.dataSource === 'mock')
const dataNotice = computed(() => offline.value ? '离线' : requestStatus.failedPaths.length ? '更新失败' : isDemo.value ? '演示' : props.dataSource === 'unknown' ? '待更新' : '')
const session = useSessionStore()
const route = ref(getCurrentRoute())
const offline = ref(false)
const isEntry = computed(() => /login-|ui-preview/.test(route.value))
const active = computed(
  () =>
    getTabsForRole(session.role).find(
      (t) => t.shellPath === route.value || t.contentPath === route.value,
    )?.key,
)
onShow(() => {
  route.value = getCurrentRoute()
  /* #ifdef H5 */ uni.hideTabBar({ animation: false, fail: () => {} }) /* #endif */
})
// #ifdef H5
const syncNetwork = () => {
  offline.value = !navigator.onLine
}
onMounted(() => {
  syncNetwork()
  window.addEventListener('online', syncNetwork)
  window.addEventListener('offline', syncNetwork)
})
onUnmounted(() => {
  window.removeEventListener('online', syncNetwork)
  window.removeEventListener('offline', syncNetwork)
})
// #endif
</script>
<template>
  <view class="app-page" :class="[`role-${session.role}`, { 'entry-page': isEntry, 'detail-page': route.startsWith('/pkg-') }]">
    <view v-if="dataNotice && !isEntry" class="data-notice-row">
      <button class="data-notice" :class="{ 'data-notice--warning': !isDemo || offline }" aria-label="查看数据说明" @click="showDataInfo = true">
        <span class="data-notice__dot" aria-hidden="true" />{{ dataNotice }}
      </button>
    </view>
    <AppSheet v-model="showDataInfo" title="数据说明">
      <view class="data-notice-copy">
        <view v-if="isDemo">当前为演示数据，不代表真实测量结果，不触发真实救援或派单。</view>
        <view v-if="offline">当前离线。已加载内容可能过期，联网后请重新进入页面更新。</view>
        <view v-if="useApiMode() && requestStatus.failedPaths.length">部分数据更新失败，页面可能保留旧内容或初始示例，不代表实时状态。请联网后重新进入页面重试。</view>
        <view v-if="props.dataSource === 'unknown'">数据尚未获取，请勿将缺失数据视为正常状态。</view>
      </view>
    </AppSheet>
    <slot />
    <!-- #ifdef H5 -->
    <RoleNavigation v-if="!isEntry" :active="active" />
    <!-- #endif -->
  </view>
</template>
