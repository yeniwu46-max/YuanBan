<template>
  <view class="app-page">
    <AppHeader label="生活帮手" title="设备管理" back="/pages/service/index" compact />
    <view class="scroll-section">
      <view class="hero green">
        <view class="between row-top">
          <view>
            <view class="pill">设备整体运行正常</view>
            <view class="device-copy">小鼋守护设备已在线，正在安心陪伴您。</view>
            <view class="muted device-desc">当前 {{ device.onlineCount }} 台设备在线，{{ device.warningCount }} 台设备电量偏低。</view>
          </view>
          <view class="iconbox device-icon">设</view>
        </view>
        <view class="grid3 device-stats">
          <view class="card stat-card"><view class="muted">在线设备</view><view class="h2">{{ device.onlineCount }} 台</view></view>
          <view class="card stat-card"><view class="muted">异常提醒</view><view class="h2 warn">{{ device.warningCount }} 条</view></view>
          <view class="card stat-card"><view class="muted">最近同步</view><view class="h2">刚刚</view></view>
        </view>
      </view>
      <view class="section-title flush-title">
        <view class="h2">我的设备</view>
      </view>
      <view class="list flush">
        <ListItem
          v-for="item in device.devices"
          :key="item.id"
          :icon="icon(item.name)"
          :icon-tone="item.status === 'warning' ? 'warm' : ''"
          :title="item.name"
          :desc="deviceDesc(item)"
          :tag="item.status === 'warning' ? '低电量' : item.status === 'offline' ? '离线' : '正常'"
          :tag-tone="item.status === 'warning' ? 'warm' : item.status === 'offline' ? 'gray' : 'normal'"
          @click="go(`/pkg-elder-detail/device-detail/index?id=${item.id}`)"
        />
      </view>
      <view v-if="device.lowBatteryDevice" class="hero warm device-tip">
        <view class="row row-top">
          <YuanMascot size="small" />
          <view>
            <view class="h2 tip-title">小鼋提醒</view>
            <view class="muted tip-copy">{{ device.lowBatteryDevice.name }}电量有点低，建议请家人帮忙充电或更换电池。</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import AppHeader from '@/components/AppHeader.vue'
import ListItem from '@/components/ListItem.vue'
import YuanMascot from '@/components/YuanMascot.vue'
import { useDeviceStore } from '@/stores/device'
import { useSessionStore } from '@/stores/session'
import { goDetail } from '@/utils/navigate'
import type { DeviceStatus } from '@/types/elder'

const device = useDeviceStore()
const session = useSessionStore()

onShow(() => {
  void device.hydrate(session.primaryElderId, { force: false })
})

function icon(name: string) {
  if (name.includes('雷达')) return '雷'
  if (name.includes('SOS')) return 'SOS'
  if (name.includes('环境')) return '境'
  return '设'
}

function deviceDesc(item: DeviceStatus) {
  const status = item.online ? '在线' : '离线'
  const battery = item.batteryPercent ? ` · 电量 ${item.batteryPercent}%` : ''
  return `${item.location} · ${status}${battery}`
}

function go(url: string) {
  goDetail(url)
}
</script>

<style scoped>
.device-copy {
  margin-top: 15px;
  font-size: 24px;
  line-height: 1.35;
  font-weight: 900;
}

.device-desc {
  margin-top: 8px;
  line-height: 1.5;
}

.device-icon {
  width: 88px;
  height: 88px;
  border-radius: 28px;
  font-size: 34px;
  font-weight: 900;
}

.device-stats {
  margin-top: 16px;
}

.stat-card {
  padding: 12px;
  text-align: center;
}

.warn {
  color: #c9822c;
}

.flush-title {
  padding: 0;
}

.device-tip {
  margin-top: 18px;
}

.tip-title {
  font-size: 18px;
}

.tip-copy {
  margin-top: 6px;
  line-height: 1.5;
}
</style>
