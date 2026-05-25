<template>
  <button class="health" @click="$emit('click')">
    <view class="iconbox" :class="{ warm: metric.status === 'warning', red: metric.status === 'danger' }">{{ icon }}</view>
    <view class="smalltitle">{{ metric.label }}</view>
    <view class="val">
      <text class="num">{{ metric.value }}</text>
      <text v-if="metric.unit" class="unit">{{ metric.unit }}</text>
    </view>
    <view class="status" :class="{ warning: metric.status === 'warning' }">{{ statusText }}</view>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { HealthMetric } from '@/types/elder'

const props = defineProps<{
  metric: HealthMetric
  icon: string
}>()

defineEmits<{ click: [] }>()

const statusText = computed(() => {
  if (props.metric.status === 'warning') return props.metric.description.includes('18:30') ? '18:30' : '需关注'
  if (props.metric.status === 'danger') return '危险'
  return props.metric.key === 'sleep' ? '良好' : '正常'
})
</script>
