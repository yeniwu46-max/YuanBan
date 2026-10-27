<template>
  <view class="empty-state card">
    <view class="empty-icon"><AppIcon :name="icon" /></view>
    <view class="empty-title">{{ title }}</view>
    <view class="muted empty-desc">{{ description }}</view>
    <BigButton v-if="actionLabel" class="empty-action" @click="$emit('action')">{{ actionLabel }}</BigButton>
  </view>
</template>

<script setup lang="ts">
import BigButton from '@/components/BigButton.vue'

withDefaults(defineProps<{
  icon?: string
  title: string
  description: string
  actionLabel?: string
}>(), {
  icon: '📭',
  actionLabel: ''
})

defineEmits<{ action: [] }>()
</script>

<style scoped lang="scss">
.empty-state {
  padding: 28px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 36px;
  line-height: 1;
}

.empty-title {
  margin-top: 12px;
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
}

.empty-desc {
  margin-top: 8px;
  line-height: 1.55;
  font-size: var(--helper-size, 16px);
}

.empty-action {
  margin-top: 18px;
}
</style>
