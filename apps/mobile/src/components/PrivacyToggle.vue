<script setup lang="ts">
import WdSwitch from 'wot-design-uni/components/wd-switch/wd-switch.vue'
withDefaults(defineProps<{ modelValue: boolean; label?: string }>(), { label: '启用此设置' })
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
</script>
<template>
  <view
    class="switch-target"
    role="switch"
    :aria-checked="modelValue"
    :aria-label="label"
    tabindex="0"
    @keydown.space.prevent="emit('update:modelValue', !modelValue)"
    @keydown.enter.prevent="emit('update:modelValue', !modelValue)"
  >
    <WdSwitch
      :model-value="modelValue"
      :size="28"
      @update:model-value="emit('update:modelValue', Boolean($event))"
    />
  </view>
</template>
<style scoped>
.switch-target {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  min-width: 56px;
  flex-shrink: 0;
}
</style>
