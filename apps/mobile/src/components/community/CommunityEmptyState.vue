<template>
  <view class="empty card">
    <text class="empty-icon">{{ icon }}</text>
    <view class="empty-title">{{ title }}</view>
    <view class="muted empty-desc">{{ description }}</view>
    <button v-if="actionLabel" class="link action" @click="$emit('action')">{{ actionLabel }}</button>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  icon: string
  title: string
  description: string
  actionLabel?: string
}>()

defineEmits<{ action: [] }>()
</script>

<style scoped>
.empty {
  padding: 28px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 36px;
}

.empty-title {
  margin-top: 12px;
  font-size: 18px;
  font-weight: 1000;
}

.empty-desc {
  margin-top: 8px;
  line-height: 1.45;
}

.action {
  margin-top: 14px;
  font-weight: 1000;
}
</style>
