<template>
  <view class="switcher-wrap">
    <button class="switcher-btn" @click="togglePanel">
      <view class="label">{{ label }}</view>
      <view class="title-row">
        <text class="h1">{{ currentName }}</text>
        <text class="chev">{{ open ? '⌃' : '⌄' }}</text>
      </view>
    </button>
    <view v-if="open" class="panel">
      <view class="panel-title">切换守护对象</view>
      <button
        v-for="elder in guardian.elders"
        :key="elder.id"
        class="panel-item"
        :class="{ active: elder.id === guardian.currentElderId }"
        @click="selectElder(elder.id)"
      >
        <view class="panel-main">
          <text class="panel-name">{{ elder.name }}</text>
          <text class="panel-desc">{{ elder.age }} 岁 · {{ elder.online ? '设备在线' : '设备离线' }}</text>
        </view>
        <StatusTag
          :label="elder.online ? '守护中' : '需关注'"
          :tone="elder.online ? 'normal' : 'warm'"
        />
      </button>
    </view>
    <view v-if="open" class="mask" @click="open = false" />
  </view>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import StatusTag from '@/components/StatusTag.vue'
import { useGuardianStore } from '@/stores/guardian'

withDefaults(defineProps<{
  label?: string
}>(), {
  label: '子女端 · 守护中心'
})

const guardian = useGuardianStore()
const open = ref(false)

const currentName = computed(() => guardian.currentElder?.name ?? '未绑定老人')

function togglePanel() {
  open.value = !open.value
}

async function selectElder(elderId: string) {
  open.value = false
  await guardian.switchElder(elderId)
}

onBeforeUnmount(() => {
  open.value = false
})
</script>

<style scoped lang="scss">
.switcher-wrap {
  position: relative;
  z-index: 3;
  flex: 1;
  min-width: 0;
}

.switcher-btn {
  width: 100%;
  text-align: left;
  padding: 0;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.h1 {
  margin-top: 2px;
  font-size: 27px;
  line-height: 1.12;
  font-weight: 1000;
  letter-spacing: -0.4px;
  color: #243a31;
}

.label {
  font-size: 14px;
  color: #7a6f5d;
  font-weight: 800;
}

.chev {
  font-size: 18px;
  color: #7a6f5d;
  margin-top: 4px;
}

.panel {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: #fffdf7;
  border: 1px solid #e9e0d0;
  border-radius: 24px;
  padding: 14px;
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.1);
  z-index: 30;
}

.panel-title {
  font-size: 14px;
  font-weight: 900;
  color: #8b7753;
  margin-bottom: 10px;
}

.panel-item {
  width: 100%;
  min-height: 58px;
  border-radius: 16px;
  background: #fff;
  border: 1px solid #efe3ce;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 8px;
}

.panel-item.active {
  background: #e6f2df;
  border-color: #9fcb91;
}

.panel-main {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  min-width: 0;
}

.panel-name {
  font-size: 18px;
  font-weight: 1000;
  color: #243a31;
}

.panel-desc {
  font-size: 13px;
  color: #7a6f5d;
}

.mask {
  position: fixed;
  inset: 0;
  z-index: 19;
  touch-action: none;
}
</style>
