<script setup lang="ts">
import { computed } from 'vue'
import { useSessionStore } from '@/stores/session'
import { getTabsForRole } from '@/utils/tabBar'
import { goRoute } from '@/utils/navigate'
import AppIcon from './AppIcon.vue'
import YuanMascot from './YuanMascot.vue'
defineProps<{ active?: string }>()
const session = useSessionStore()
const tabs = computed(() => getTabsForRole(session.role))
const roleLabel = computed(
  () => ({ elder: '长辈空间', family: '家人守护', community: '社区工作台' })[session.role],
)
</script>
<template>
  <view
    class="role-nav"
    :class="`role-nav--${session.role}`"
    role="navigation"
    :aria-label="roleLabel"
  >
    <view class="role-nav-brand">
      <YuanMascot size="small" portrait />
      <view>
        <text>鼋伴伴</text>
        <view>{{ roleLabel }}</view>
      </view>
    </view>
    <button
      v-for="tab in tabs"
      :key="tab.key"
      class="role-nav-item"
      :class="{ active: active === tab.key }"
      :aria-current="active === tab.key ? 'page' : undefined"
      @click="goRoute(tab.shellPath)"
    >
      <AppIcon :name="tab.key" :size="24" />
      <text>{{ tab.label }}</text>
    </button>
    <view class="role-nav-foot">
      <button @click="goRoute('/pages/login-role/index')">
        切换身份
        <AppIcon name="arrow" :size="16" />
      </button>
    </view>
  </view>
</template>
