<template>
  <view class="card timeline">
    <view v-for="(step, index) in steps" :key="step.id" class="step-block">
      <view class="row">
        <view class="iconbox" :class="stepTone(step)">
          {{ stepIcon(step) }}
        </view>
        <view class="step-main">
          <view class="step-title">{{ step.title }}</view>
          <view class="muted step-desc">{{ step.detail }}</view>
        </view>
      </view>
      <view v-if="index < steps.length - 1" class="divider" />
    </view>
  </view>
</template>

<script setup lang="ts">
import type { AlertTimelineStep } from '@/types/family'

defineProps<{
  steps: AlertTimelineStep[]
}>()

function stepTone(step: AlertTimelineStep) {
  if (step.pending) return 'warm'
  if (step.done) return ''
  return 'gray'
}

function stepIcon(step: AlertTimelineStep) {
  if (step.pending) return '⏳'
  if (step.done) return '✓'
  return '○'
}
</script>

<style scoped lang="scss">
.timeline {
  padding: 16px;
}

.step-block + .step-block {
  margin-top: 0;
}

.step-title {
  font-size: 16px;
  font-weight: 900;
  color: #243a31;
}

.step-desc {
  margin-top: 4px;
  font-size: 14px;
  line-height: 1.35;
}

.divider {
  height: 1px;
  background: #efe7d8;
  margin: 14px 0 14px 56px;
}
</style>
