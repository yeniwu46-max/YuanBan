<template>
  <view class="grid4">
    <button v-for="action in actions" :key="action.key" class="quick-action" @click="$emit('action', action.key)">
      <text class="action-icon">{{ action.icon }}</text>
      <text class="action-label">{{ action.label }}</text>
    </button>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export type QuickCareAction = 'video' | 'phone' | 'voice' | 'location' | 'photo'

const props = withDefaults(defineProps<{
  variant?: 'guardian' | 'care'
}>(), {
  variant: 'guardian'
})

defineEmits<{ action: [QuickCareAction] }>()

const actions = computed(() => {
  if (props.variant === 'care') {
    return [
      { key: 'video' as const, icon: '📹', label: '视频' },
      { key: 'phone' as const, icon: '☎', label: '电话' },
      { key: 'voice' as const, icon: '🎙', label: '语音' },
      { key: 'photo' as const, icon: '📷', label: '传照片' }
    ]
  }
  return [
    { key: 'video' as const, icon: '📹', label: '视频' },
    { key: 'phone' as const, icon: '☎', label: '电话' },
    { key: 'voice' as const, icon: '🎙', label: '语音' },
    { key: 'location' as const, icon: '📍', label: '位置' }
  ]
})
</script>

<style scoped lang="scss">
@import '@/styles/motion.scss';

.quick-action {
  height: 92px;
  border-radius: 24px;
  background: #fff;
  border: 1px solid #efe3ce;
  box-shadow: 0 4px 12px rgba(63, 52, 29, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 1000;
  color: #315943;
  @include pressable-sm;
}

.action-icon {
  font-size: 22px;
  line-height: 1;
}

.action-label {
  line-height: 1;
  white-space: nowrap;
}
</style>
