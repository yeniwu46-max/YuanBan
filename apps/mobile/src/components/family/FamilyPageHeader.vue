<template>
  <view class="header">
    <ElderSwitcher v-if="switchable" :label="label" />
    <view v-else>
      <view class="label">{{ label }}</view>
      <view class="h1">{{ title }}</view>
    </view>
    <button class="iconbtn">🔔</button>
  </view>
</template>

<script setup lang="ts">
import ElderSwitcher from '@/components/family/ElderSwitcher.vue'

withDefaults(defineProps<{
  label: string
  title?: string
  switchable?: boolean
}>(), {
  title: '',
  switchable: false
})
</script>

<style scoped lang="scss">
.header {
  position: relative;
  z-index: 2;
  padding: 30px 24px 14px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.label {
  font-size: 14px;
  color: #7a6f5d;
  font-weight: 800;
}

.h1 {
  margin-top: 2px;
  font-size: 27px;
  line-height: 1.12;
  font-weight: 1000;
  color: #243a31;
}
</style>
