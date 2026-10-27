<template>
  <button role="button" tabindex="0" @click="$emit('click')" @keydown.enter.prevent="$emit('click')" @keydown.space.prevent="$emit('click')"><slot /></button>
</template>

<script setup lang="ts">
defineEmits<{ click: [] }>()
</script>
