<template>
  <view class="header">
    <button v-if="back" class="iconbtn" @click="goBack">‹</button>
    <view :class="back ? 'title' : ''">
      <view class="label">{{ label }}</view>
      <view class="h1" :style="{ fontSize: compact ? '27px' : undefined }">{{ title }}</view>
    </view>
    <button class="iconbtn">🔔</button>
  </view>
</template>

<script setup lang="ts">
import { goBack as navigateBack } from '@/utils/navigate'

const props = withDefaults(defineProps<{
  label: string
  title: string
  back?: string
  compact?: boolean
  useBack?: boolean
}>(), {
  back: '',
  compact: false,
  useBack: true
})

function goBack() {
  if (props.back && props.useBack) {
    navigateBack(props.back)
    return
  }
  if (props.back) {
    uni.redirectTo({ url: props.back, fail: () => uni.reLaunch({ url: props.back }) })
    return
  }
  uni.navigateBack()
}
</script>

