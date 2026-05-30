<template>
  <button
    class="item task-item"
    :class="{ done: task.status === 'done', completing: completing }"
    :disabled="completing"
    @click="$emit('click')"
  >
    <view class="iconbox" :class="task.iconTone">{{ task.icon }}</view>
    <view class="item-main">
      <view class="item-title">{{ task.title }}</view>
      <view class="desc">{{ task.description }}</view>
    </view>
    <template v-if="completing">
      <view class="task-spinner" />
    </template>
    <StatusTag v-else-if="task.status === 'done'" label="完成" />
    <text v-else class="chev">›</text>
  </button>
</template>

<script setup lang="ts">
import StatusTag from '@/components/StatusTag.vue'
import type { CareTask } from '@/types/family'

defineProps<{
  task: CareTask
  completing?: boolean
}>()

defineEmits<{ click: [] }>()
</script>

<style scoped lang="scss">
@import '@/styles/motion.scss';

.task-item {
  width: 100%;
}

.task-item.done {
  opacity: 0.92;
}

.task-item.completing {
  opacity: 0.72;
  cursor: wait;
}

.task-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #9fcb91;
  border-top-color: transparent;
  border-radius: 50%;
  animation: task-spin 0.7s linear infinite;
  flex-shrink: 0;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 0.5;
  }
}

@keyframes task-spin {
  to { transform: rotate(360deg); }
}
</style>
