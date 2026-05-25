<template>
  <view class="header">
    <view v-if="showBack" class="header-side">
      <button class="iconbtn" @click="onBack">‹</button>
    </view>
    <view class="header-main" :class="{ center: showBack }">
      <view class="label">{{ label }}</view>
      <view class="h1">{{ title }}</view>
    </view>
    <view class="header-side row-actions">
      <button v-if="!showBack" class="iconbtn">⌕</button>
      <button class="iconbtn notify">
        🔔
        <text v-if="notifyDot" class="dot" />
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { goBack } from '@/utils/navigate'

const props = withDefaults(defineProps<{
  label: string
  title: string
  showBack?: boolean
  backFallback?: string
  notifyDot?: boolean
}>(), {
  showBack: false,
  backFallback: '/pages/community/dashboard/index',
  notifyDot: true
})

function onBack() {
  goBack(props.backFallback)
}
</script>

<style scoped lang="scss">
.header {
  position: relative;
  z-index: 2;
  padding: 30px 24px 14px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.header-main {
  flex: 1;
  min-width: 0;
}

.header-main.center {
  text-align: center;
}

.header-side {
  width: 48px;
  flex-shrink: 0;
}

.row-actions {
  display: flex;
  gap: 8px;
  width: auto;
}

.label {
  font-size: 14px;
  color: #7a6f5d;
  font-weight: 800;
}

.h1 {
  margin-top: 2px;
  font-size: 28px;
  line-height: 1.12;
  font-weight: 1000;
  color: #243a31;
}

.iconbtn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #fff;
  border: 1px solid #e9e0d0;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #446a57;
  font-size: 22px;
  position: relative;
}

.notify .dot {
  position: absolute;
  right: 8px;
  top: 8px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #e56b5f;
}
</style>
