<template>
  <button class="bigbtn" :class="toneClass" @click="$emit('click')">
    <slot>{{ label }}</slot>
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  label?: string
  tone?: 'green' | 'red' | 'warm' | 'white'
}>(), {
  tone: 'green'
})

defineEmits<{ click: [] }>()

const toneClass = {
  green: 'btngreen',
  red: 'btnred',
  warm: 'btnwarm',
  white: 'btnwhite'
}[props.tone]
</script>

