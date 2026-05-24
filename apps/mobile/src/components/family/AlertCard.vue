<template>
  <button class="item alert-card" @click="$emit('click')">
    <view class="iconbox" :class="iconToneClass">{{ alert.icon }}</view>
    <view class="item-main">
      <view class="item-title">{{ alert.title }}</view>
      <view class="desc">{{ alert.description }}</view>
    </view>
    <StatusTag :label="alert.tag" :tone="alert.tagTone" />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import StatusTag from '@/components/StatusTag.vue'
import type { AlertEvent } from '@/types/family'

const props = defineProps<{
  alert: AlertEvent
}>()

defineEmits<{ click: [] }>()

const iconToneClass = computed(() => {
  if (props.alert.tagTone === 'warm') return 'warm'
  if (props.alert.tagTone === 'red') return 'red'
  if (props.alert.tagTone === 'gray') return 'gray'
  return ''
})
</script>

<style scoped>
.alert-card {
  width: 100%;
}
</style>
