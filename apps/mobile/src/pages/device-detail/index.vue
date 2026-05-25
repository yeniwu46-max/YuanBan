<template>
  <view class="app-page">
    <AppHeader label="生活帮手" title="设备详情" back="/pages/device/index" compact />
    <view class="scroll-section">
      <view class="hero" :class="deviceInfo?.status === 'warning' ? 'warm' : deviceInfo?.status === 'offline' ? 'gray' : 'green'">
        <view class="between row-top">
          <view>
            <view class="pill">{{ statusLabel }}</view>
            <view class="device-title">{{ deviceInfo?.name }}</view>
            <view class="muted device-copy">{{ deviceInfo?.location }} · {{ deviceInfo?.online ? '在线' : '离线' }}</view>
          </view>
          <view class="iconbox device-icon">设</view>
        </view>
        <view class="grid3 stats">
          <view class="card stat-card"><view class="muted">位置</view><view class="h2">{{ deviceInfo?.location }}</view></view>
          <view class="card stat-card"><view class="muted">电量</view><view class="h2">{{ deviceInfo?.batteryPercent ?? 100 }}%</view></view>
          <view class="card stat-card"><view class="muted">同步</view><view class="h2">刚刚</view></view>
        </view>
      </view>
      <view class="section-title flush-title"><view class="h2">设备操作</view></view>
      <view class="grid2">
        <BigButton @click="refresh">刷新状态</BigButton>
        <BigButton tone="white" @click="requestHelp">提醒家人</BigButton>
      </view>
      <view v-if="device.operationMessage" class="card feedback">{{ device.operationMessage }}</view>
      <view class="hero gray tip">
        <view class="h2 tip-title">说明</view>
        <view class="muted tip-copy">当前为演示状态，暂不连接真实硬件。后续接入设备后会同步电量、在线状态和异常提醒。</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import AppHeader from '@/components/AppHeader.vue'
import BigButton from '@/components/BigButton.vue'
import { useDeviceStore } from '@/stores/device'

const device = useDeviceStore()
const id = ref('d1')
const deviceInfo = computed(() => device.deviceById(id.value) ?? device.devices[0])
const statusLabel = computed(() => {
  if (deviceInfo.value?.status === 'warning') return '需要关注'
  if (deviceInfo.value?.status === 'offline') return '设备离线'
  return '运行正常'
})

onLoad((query) => {
  if (query?.id) id.value = String(query.id)
})

function refresh() {
  device.refreshDevice(id.value)
}

function requestHelp() {
  device.requestBatteryHelp(id.value)
}
</script>

<style scoped>
.device-title {
  margin-top: 16px;
  font-size: 28px;
  line-height: 1.2;
  font-weight: 900;
}

.device-copy {
  margin-top: 8px;
}

.device-icon {
  width: 84px;
  height: 84px;
  border-radius: 28px;
  font-size: 34px;
  font-weight: 900;
}

.stats {
  margin-top: 16px;
}

.stat-card {
  padding: 12px;
  text-align: center;
}

.flush-title {
  padding: 0;
}

.feedback {
  margin-top: 16px;
  padding: 12px 14px;
  color: #315943;
  font-weight: 900;
}

.tip {
  margin-top: 18px;
}

.tip-title {
  font-size: 18px;
}

.tip-copy {
  margin-top: 8px;
  line-height: 1.5;
}
</style>
