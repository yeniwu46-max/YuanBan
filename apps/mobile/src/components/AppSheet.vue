<script setup lang="ts">
import { getCurrentInstance, nextTick, onUnmounted, ref, watch } from 'vue'
import { onBackPress } from '@dcloudio/uni-app'
import WdPopup from 'wot-design-uni/components/wd-popup/wd-popup.vue'
const props = defineProps<{ modelValue: boolean; title: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
const id = 'sheet-' + getCurrentInstance()!.uid
const panel = ref<{ $el: HTMLElement } | HTMLElement>()
let previous: HTMLElement | null = null
let timer: ReturnType<typeof setTimeout> | undefined
const close = () => emit('update:modelValue', false)
// #ifdef H5
const element = () => (panel.value instanceof HTMLElement ? panel.value : panel.value?.$el)
function nativeBack(event: Event) {
  if (props.modelValue) {
    event.preventDefault()
    close()
  }
}
function keydown(event: KeyboardEvent) {
  if (!props.modelValue) return
  if (event.key === 'Escape') {
    event.preventDefault()
    close()
    return
  }
  if (event.key !== 'Tab') return
  const nodes = Array.from(
    element()?.querySelectorAll<HTMLElement>('button,[tabindex="0"],input') || [],
  ).filter((el) => el.getClientRects().length > 0)
  const first = nodes[0],
    last = nodes[nodes.length - 1]
  if (!first) {
    event.preventDefault()
    element()?.focus()
    return
  }
  if (
    event.shiftKey &&
    (document.activeElement === first || document.activeElement === element())
  ) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}
watch(
  () => props.modelValue,
  async (open) => {
    clearTimeout(timer)
    if (open) {
      previous = document.activeElement as HTMLElement
      document.addEventListener('keydown', keydown)
      window.addEventListener('yuanbanban:back', nativeBack)
      await nextTick()
      timer = setTimeout(() => element()?.focus(), 240)
    } else {
      document.removeEventListener('keydown', keydown)
      window.removeEventListener('yuanbanban:back', nativeBack)
      previous?.focus()
    }
  },
)
onUnmounted(() => {
  clearTimeout(timer)
  document.removeEventListener('keydown', keydown)
  window.removeEventListener('yuanbanban:back', nativeBack)
})
// #endif
onBackPress(() => {
  if (props.modelValue) {
    close()
    return true
  }
  return false
})
</script>
<template>
  <WdPopup
    :model-value="modelValue"
    position="bottom"
    :z-index="100"
    :duration="220"
    safe-area-inset-bottom
    root-portal
    custom-style="border-radius:26px 26px 0 0;max-width:640px;left:50%;transform:translateX(-50%);width:100%;background:var(--surface)"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <view
      :id="id"
      ref="panel"
      role="dialog"
      aria-modal="true"
      :aria-label="title"
      tabindex="-1"
      class="sheet-panel"
    >
      <view class="between">
        <view class="h2">{{ title }}</view>
        <button class="iconbtn" aria-label="关闭面板" @click="close">
          <AppIcon name="close" />
        </button>
      </view>
      <view class="sheet-body"><slot /></view>
    </view>
  </WdPopup>
</template>
<style scoped>
.sheet-panel {
  padding: 24px;
  outline: none;
  max-height: 80vh;
  overflow: auto;
  box-sizing: border-box;
}
.sheet-body {
  margin-top: 20px;
}
</style>
