<template>
  <button class="toggle" :class="{ on: modelValue }" @click="$emit('update:modelValue', !modelValue)">
    <view></view>
  </button>
</template>

<script setup lang="ts">
defineProps<{ modelValue: boolean }>()
defineEmits<{ 'update:modelValue': [value: boolean] }>()
</script>

<style scoped lang="scss">
@import '@/styles/motion.scss';

.toggle {
  position: relative;
  width: 56px;
  height: 32px;
  border-radius: 999px;
  background: #d9d2c3;
  flex-shrink: 0;
  transition: background-color 200ms $ease-press, transform $duration-press $ease-press;

  &:active {
    transform: scale(0.93);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: background-color 200ms linear;
    &:active { transform: none; }
  }
}

.toggle.on {
  background: #7ab66b;
}

.toggle view {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: left 200ms $ease-press;

  @media (prefers-reduced-motion: reduce) {
    transition: left 200ms linear;
  }
}

.toggle.on view {
  left: 28px;
}
</style>

