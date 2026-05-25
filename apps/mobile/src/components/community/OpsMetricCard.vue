<template>
  <button class="health-card" @click="$emit('click')">
    <view class="iconbox" :class="metric.iconTone">{{ metric.icon }}</view>
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
  border: 1px solid #efe3ce;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(63, 52, 29, 0.05);
  text-align: left;
  width: 100%;
}

.small-title {
  margin-top: 12px;
  font-size: 15px;
  color: #7a6f5d;
  font-weight: 800;
}

.value {
  margin-top: 4px;
}

.num {
  font-size: 25px;
  line-height: 1;
  font-weight: 1000;
  color: #243a31;
}

.status {
  margin-top: 8px;
  font-size: 14px;
  font-weight: 1000;
  color: #5b8b62;
}

.status.warm {
  color: #c9822c;
}
</style>
