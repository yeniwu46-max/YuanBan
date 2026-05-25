<template>
  <button class="row-card order-card" @click="$emit('click')">
    <view class="iconbox" :class="toneClass">{{ order.icon }}</view>
    <view class="row-main">
      <view class="row-title">{{ order.title }}</view>
      <view class="row-desc">{{ order.description }}</view>
      <text v-if="order.code" class="code">{{ order.code }}</text>
    </view>
    <view class="row-end">
      <StatusTag :label="order.tag" :tone="tagTone" />
      <text class="chev">›</text>
    </view>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import StatusTag from '@/components/StatusTag.vue'
import type { WorkOrder } from '@/types/community'

const props = defineProps<{ order: WorkOrder }>()
defineEmits<{ click: [] }>()

const toneClass = computed(() => {
  const t = props.order.iconTone
  if (t === 'warm' || t === 'red' || t === 'gray') return t
  return ''
})

const tagTone = computed(() => {
  const t = props.order.tagTone
  if (t === 'green') return 'normal'
  if (t === 'warm' || t === 'red' || t === 'gray') return t
  return 'normal'
})
</script>

<style scoped>
.order-card {
  width: 100%;
  min-height: 92px;
  text-align: left;
}

.code {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  font-weight: 800;
  color: #9b8b71;
}

.row-end {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  flex-shrink: 0;
}

.chev {
  color: #b8aa92;
  font-size: 24px;
}
</style>
