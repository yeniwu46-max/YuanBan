<template>
  <svg class="jade-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path v-for="(path, index) in paths[name]" :key="index" :d="path" />
  </svg>
</template>

<script setup lang="ts">
defineProps<{ name: 'home' | 'heart' | 'mic' | 'shield' | 'phone' | 'moon' | 'pill' | 'arrow' | 'leaf' | 'grid' | 'wind' }>()
const paths = {
  home: ['M3 10 12 3l9 7', 'M5 9v11h5v-6h4v6h5V9'],
  heart: ['M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z', 'M3 12h4l2-4 4 8 2-4h6'],
  mic: ['M9 5a3 3 0 0 1 6 0v6a3 3 0 0 1-6 0Z', 'M5 10v1a7 7 0 0 0 14 0v-1', 'M12 18v4M8 22h8'],
  shield: ['M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6Z', 'm8.5 12 2.5 2.5 4.5-5'],
  phone: ['M5 3h4l2 5-3 2a15 15 0 0 0 6 6l2-3 5 2v4c0 1-1 2-2 2A18 18 0 0 1 3 5c0-1 1-2 2-2Z'],
  moon: ['M20.5 14A9 9 0 0 1 10 3.5 9 9 0 1 0 20.5 14Z', 'M17 3v4M15 5h4'],
  pill: ['m8 4-4 4a6 6 0 0 0 8 8l4-4a6 6 0 0 0-8-8Z', 'm6 6 8 8', 'M17 16v6M14 19h6'],
  arrow: ['m9 5 7 7-7 7'],
  leaf: ['M20 3C9 3 3 7 4 14c1 6 10 7 14 1 2-3 2-8 2-12Z', 'M3 21 15 9'],
  grid: ['M3 3h7v7H3ZM14 3h7v7h-7ZM3 14h7v7H3ZM14 14h7v7h-7Z'],
  wind: ['M3 8h12a3 3 0 1 0-3-3', 'M3 12h16a3 3 0 1 1-3 3', 'M3 16h5a3 3 0 1 1-3 3']
}
</script>

<style scoped>
.jade-icon { display: block; width: 24px; height: 24px; flex-shrink: 0; }
</style>
