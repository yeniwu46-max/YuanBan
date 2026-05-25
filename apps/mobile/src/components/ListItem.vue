<template>
  <button class="item" @click="$emit('click')">
    <view class="iconbox" :class="iconTone">{{ icon }}</view>
    <view class="item-main">
      <view class="item-title">
        <text>{{ title }}</text>
        <StatusTag v-if="tag" :label="tag" :tone="tagTone" />
      </view>
      <view v-if="desc" class="desc">{{ desc }}</view>
    </view>
    <slot name="right">
      <text v-if="rightText" class="item-right">{{ rightText }}</text>
      <text v-if="chev" class="chev">›</text>
    </slot>
  </button>
</template>

<script setup lang="ts">
import StatusTag from './StatusTag.vue'

withDefaults(defineProps<{
  icon: string
  title: string
  desc?: string
  tag?: string
  tagTone?: 'normal' | 'warm' | 'red' | 'gray'
  iconTone?: 'warm' | 'red' | 'gray' | ''
  rightText?: string
  chev?: boolean
}>(), {
  desc: '',
  tag: '',
  tagTone: 'normal',
  iconTone: '',
  rightText: '',
  chev: true
})

defineEmits<{ click: [] }>()
</script>

<style scoped>
.item-right {
  font-size: 18px;
  font-weight: 900;
  color: #243a31;
}
</style>
