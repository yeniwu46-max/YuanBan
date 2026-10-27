<script setup lang="ts">
import { computed } from 'vue'
import WdButton from 'wot-design-uni/components/wd-button/wd-button.vue'
const props = withDefaults(
  defineProps<{
    label?: string
    tone?: 'green' | 'red' | 'warm' | 'white'
    disabled?: boolean
    loading?: boolean
  }>(),
  { tone: 'green', disabled: false, loading: false },
)
const emit = defineEmits<{ click: [] }>()
const style = computed(
  () =>
    'width:100%;min-width:0;min-height:56px;height:auto;padding:16px 10px;font-size:inherit;line-height:1.4;border-radius:20px;font-weight:600;' +
    {
      green: 'background:var(--action-gradient);color:white;border-color:var(--primary)',
      red: 'background:var(--red);color:white;border-color:var(--red)',
      warm: 'background:var(--warm-soft);color:var(--warm);border-color:#e5d5b5',
      white: 'background:white;color:var(--primary);border-color:var(--line)',
    }[props.tone],
)
</script>
<template>
  <WdButton
    block
    :custom-style="style"
    :disabled="disabled || loading"
    :loading="loading"
    @click="!disabled && !loading && emit('click')"
  >
    <slot>{{ loading ? '处理中…' : label }}</slot>
  </WdButton>
</template>
