<script setup lang="ts">
import { computed, ref } from 'vue'
import AppSheet from '@/components/AppSheet.vue'
import StatusTag from '@/components/StatusTag.vue'
import { useGuardianStore } from '@/stores/guardian'
withDefaults(defineProps<{ label?: string }>(), { label: '守护家人' })
const guardian = useGuardianStore(),
  open = ref(false)
const currentName = computed(() => guardian.currentElder?.name || '未绑定长辈')
async function select(id: string) {
  await guardian.switchElder(id)
  open.value = false
}
</script>
<template>
  <view class="elder-switcher">
    <button
      class="elder-switcher-trigger"
      :aria-expanded="open"
      aria-haspopup="dialog"
      aria-label="切换守护对象"
      @click="open = true"
    >
      <view class="label">{{ label }}</view>
      <view class="row">
        <text class="h1">{{ currentName }}</text>
        <AppIcon name="down" :size="20" />
      </view>
    </button>
    <AppSheet v-model="open" title="选择要守护的长辈">
      <view class="elder-options">
        <button
          v-for="elder in guardian.elders"
          :key="elder.id"
          class="item"
          :aria-pressed="elder.id === guardian.currentElderId"
          @click="select(elder.id)"
        >
          <view class="iconbox"><AppIcon name="users" /></view>
          <view class="item-main">
            <view class="item-title">{{ elder.name }}</view>
            <view class="desc">
              {{ elder.age }} 岁 · {{ elder.online ? '设备在线' : '设备离线' }}
            </view>
          </view>
          <StatusTag
            :label="
              elder.id === guardian.currentElderId ? '已选择' : elder.online ? '守护中' : '需关注'
            "
            :tone="elder.online ? 'normal' : 'warm'"
          />
        </button>
      </view>
    </AppSheet>
  </view>
</template>
<style scoped>
.elder-switcher {
  flex: 1;
  min-width: 0;
}
.elder-switcher-trigger {
  text-align: left;
  min-height: 60px;
  width: 100%;
}
.elder-switcher-trigger .h1 {
  margin-top: 6px;
}
.elder-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
