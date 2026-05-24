<template>
  <view class="progress">
    <view class="progress-fill" :style="{ width: `${value}%` }"></view>
  </view>
</template>

<script setup lang="ts">
defineProps<{ value: number }>()
</script>

