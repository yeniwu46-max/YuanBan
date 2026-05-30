<template>
  <button
    class="btn-root"
    :class="[toneClass, { 'btn--disabled': disabled || loading, 'btn--loading': loading }]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <template v-if="loading">
      <span class="btn__spinner" />
      <span>处理中…</span>
    </template>
    <slot v-else>{{ label }}</slot>
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  label?: string
  tone?: 'green' | 'red' | 'warm' | 'white'
  disabled?: boolean
  loading?: boolean
}>(), {
  tone: 'green',
  disabled: false,
  loading: false,
})

const emit = defineEmits<{ click: [] }>()

function handleClick() {
  if (!props.disabled && !props.loading) emit('click')
}

const toneClass = {
  green: 'btn--green',
  red: 'btn--red',
  warm: 'btn--warm',
  white: 'btn--white',
}[props.tone]
</script>

<style scoped lang="scss">
@import '@/styles/motion.scss';

// ─── 基础结构（迁自全局 .bigbtn） ──────────────────────────
.btn-root {
  width: 100%;
  box-sizing: border-box;
  min-height: 64px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 900;
  text-align: center;
  @include pressable;

  &:active:not(.btn--disabled) {
    box-shadow: 0 2px 4px rgba(63, 52, 29, 0.08) !important;
  }
}

// ─── Tone 变体 ─────────────────────────────────────────────
.btn--green {
  background: #7ab66b;
  color: #fff;
  box-shadow: 0 6px 14px rgba(122, 182, 107, 0.26);
}

.btn--red {
  background: #e56b5f;
  color: #fff;
  box-shadow: 0 6px 14px rgba(229, 107, 95, 0.26);
}

.btn--warm {
  background: #e8a64e;
  color: #fff;
  box-shadow: 0 6px 14px rgba(232, 166, 78, 0.24);
}

.btn--white {
  background: #fff;
  color: #315943;
  border: 1px solid #d6e8d4;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.04);
}

// ─── 状态 ──────────────────────────────────────────────────
.btn--disabled {
  opacity: 0.48;
  cursor: not-allowed;

  &:active {
    transform: none !important;
    box-shadow: inherit !important;
  }
}

.btn--loading {
  cursor: wait;
}

// ─── Loading spinner ───────────────────────────────────────
.btn__spinner {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: btn-spin 0.7s linear infinite;
  flex-shrink: 0;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 0.6;
  }
}

@keyframes btn-spin {
  to { transform: rotate(360deg); }
}
</style>
