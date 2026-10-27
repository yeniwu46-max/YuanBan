<script setup lang="ts">
import { computed } from 'vue'
import { mascotArtwork, mascotPortrait } from '@/config/mascot'
import type { MascotState } from '@/types/presentation'

const props = withDefaults(
  defineProps<{
    size?: 'small' | 'normal' | 'large' | 'xlarge'
    shape?: 'circle' | 'square' | 'mini'
    /** Kept for existing callers; the heart is part of the generated artwork. */
    heart?: boolean
    state?: MascotState
    portrait?: boolean
  }>(),
  { size: 'normal', shape: 'circle', heart: false, state: 'greeting', portrait: false },
)
const artwork = computed(() => mascotArtwork[props.state] ?? mascotArtwork.greeting)
const source = computed(() => props.portrait ? mascotPortrait : artwork.value.src)
const label = computed(() => props.portrait ? '鼋伴伴小鼋品牌头像' : artwork.value.label)
</script>

<template>
  <view
    class="yuan-mascot"
    :class="[`yuan-mascot--${size}`, `yuan-mascot--${state}`, { 'yuan-mascot--portrait': portrait }]"
    :data-mascot-state="portrait ? 'avatar' : state"
    role="img"
    :aria-label="label"
  >
    <image
      :key="source"
      :src="source"
      class="yuan-mascot-image"
      mode="aspectFit"
      aria-hidden="true"
    />
  </view>
</template>

<style scoped lang="scss">
.yuan-mascot {
  width: 90px;
  height: 98px;
  position: relative;
  flex-shrink: 0;
}
.yuan-mascot-image {
  display: block;
  width: 100%;
  height: 100%;
  animation: yuan-appear 180ms ease-out both;
}
.yuan-mascot--small {
  width: 48px;
  height: 52px;
}
.yuan-mascot--large {
  width: 132px;
  height: 142px;
}
.yuan-mascot--xlarge {
  width: 220px;
  height: 236px;
}
.yuan-mascot--portrait {
  aspect-ratio: 1;
}
@keyframes yuan-appear {
  from { opacity: 0.65; transform: translateY(2px); }
  to { opacity: 1; transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .yuan-mascot-image { animation: none; }
}
</style>
