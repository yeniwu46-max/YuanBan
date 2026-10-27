<script setup lang="ts">
import YuanMascot from './YuanMascot.vue'
import type { MascotState } from '@/types/presentation'
withDefaults(defineProps<{ title?: string; state?: MascotState; mascot?: boolean }>(), {
  state: 'greeting', mascot: true,
})
</script>
<template>
  <view class="aqua-hero">
    <view class="aqua-hero__orbit" aria-hidden="true" />
    <view class="aqua-hero__main">
      <view class="aqua-hero__copy">
        <view v-if="title" class="aqua-hero__title">{{ title }}</view>
        <slot />
      </view>
      <YuanMascot v-if="mascot" size="large" :state="state" />
    </view>
    <view v-if="$slots.footer" class="aqua-hero__footer"><slot name="footer" /></view>
  </view>
</template>
<style scoped lang="scss">
.aqua-hero {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  padding: 24px;
  border-radius: 28px;
  color: white;
  background: radial-gradient(ellipse at 90% 0, #5ddbe04a, transparent 60%), var(--hero-gradient);
  box-shadow: inset 0 1px 0 #ffffff45, 0 12px 30px #1864b51a;
}
.aqua-hero__orbit {
  position: absolute;
  z-index: -1;
  width: 360px;
  height: 260px;
  right: -155px;
  top: -92px;
  border: 32px solid #a3fff330;
  border-radius: 50%;
  transform: rotate(-32deg);
  box-shadow: 0 0 0 1px #ffffff35, 0 0 0 22px #cefff90a;
  pointer-events: none;
}
.aqua-hero__main { display: flex; align-items: center; gap: 10px; }
.aqua-hero__copy { flex: 1; min-width: 0; }
.aqua-hero__title { font-size: 26px; font-weight: 650; line-height: 1.3; margin-bottom: 12px; text-wrap: balance; }
.aqua-hero__footer { margin-top: 20px; }
.aqua-hero :deep(.yuan-mascot) { width: 128px; height: 154px; flex-shrink: 0; }
.aqua-hero :deep(.pill) { background: #fff; color: var(--primary); }
@media(max-width:359px) {
  .aqua-hero { padding: 20px; }
  .aqua-hero__title { font-size: 24px; }
  .aqua-hero :deep(.yuan-mascot) { width: 104px; height: 128px; }
}
</style>
