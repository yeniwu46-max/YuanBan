<template>
  <button class="health-card" @click="$emit('click')">
    <view class="iconbox" :class="metric.iconTone"><AppIcon :name="metric.icon" /></view>
    <view class="small-title">{{ metric.title }}</view>
    <view class="value">
      <text class="num">{{ metric.value }}</text>
    </view>
    <view class="status" :class="metric.statusTone">{{ metric.statusLabel }}</view>
  </button>
</template>

<script setup lang="ts">
import type { OpsMetric } from '@/types/community'

defineProps<{ metric: OpsMetric }>()
defineEmits<{ click: [] }>()
</script>

<style scoped>
.health-card {
  min-height: 116px;
  border-radius: 24px;
  background: white;
  border: 1px solid var(--line);
  padding: 16px;
  box-shadow: 0 4px 12px rgba(63, 52, 29, 0.05);
  text-align: left;
  width: 100%;
}

.small-title {
  margin-top: 12px;
  font-size: var(--helper-size, 16px);
  color: var(--muted);
  font-weight: 600;
}

.value {
  margin-top: 4px;
}

.num {
  font-size: 25px;
  line-height: 1;
  font-weight: 600;
  color: var(--text);
}

.status {
  margin-top: 8px;
  font-size: var(--helper-size, 16px);
  font-weight: 600;
  color: var(--primary);
}

.status.warm {
  color: var(--warm);
}
</style>
