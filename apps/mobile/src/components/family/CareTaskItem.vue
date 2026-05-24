<template>
  <button class="item task-item" :class="{ done: task.status === 'done' }" @click="$emit('click')">
    <view class="iconbox" :class="task.iconTone">{{ task.icon }}</view>
    <view class="item-main">
      <view class="item-title">{{ task.title }}</view>
      <view class="desc">{{ task.description }}</view>
    </view>
    <StatusTag v-if="task.status === 'done'" label="完成" />
    <text v-else class="chev">›</text>
  </button>
</template>

<script setup lang="ts">
import StatusTag from '@/components/StatusTag.vue'
import type { CareTask } from '@/types/family'

defineProps<{
  task: CareTask
}>()

defineEmits<{ click: [] }>()
</script>

<style scoped>
.task-item {
  width: 100%;
}

.task-item.done {
  opacity: 0.92;
}
</style>
