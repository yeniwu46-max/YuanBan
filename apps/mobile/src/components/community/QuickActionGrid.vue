<template>
  <view class="quick-grid">
    <button v-for="item in actions" :key="item.key" class="quick-action" @click="$emit('action', item.key)">
      <text class="qa-icon">{{ item.icon }}</text>
      <text>{{ item.label }}</text>
    </button>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  actions: { key: string; icon: string; label: string }[]
}>()

defineEmits<{ action: [key: string] }>()
</script>

<style scoped lang="scss">
@import '@/styles/motion.scss';

.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.quick-action {
  height: 92px;
  border-radius: 24px;
  background: white;
  border: 1px solid #efe3ce;
  box-shadow: 0 4px 12px rgba(63, 52, 29, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 1000;
  color: #315943;
  @include pressable-sm;
}

.qa-icon {
  font-size: 22px;
}
</style>
