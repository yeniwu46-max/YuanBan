<template>
  <view class="app-page login-page">
    <AppHeader label="绑定守护设备" title="连接小鼋设备" back="/pages/login-profile/index" />
    <view class="section center">
      <view class="muted intro">请让设备靠近手机，或扫描设备上的二维码。</view>
    </view>
    <view class="section device-card">
      <view class="hero green center">
        <view class="qr">YBB</view>
        <view class="h2 qr-title">等待设备连接</view>
        <view class="muted qr-copy">已发现附近设备：YBB-2026-01</view>
      </view>
    </view>
    <view class="list">
      <ListItem icon="✓" title="网络连接" desc="家庭 Wi-Fi 已连接" :chev="false" />
      <ListItem icon="✓" title="设备发现" desc="已发现小鼋守护设备" :chev="false" />
      <ListItem icon="安" icon-tone="warm" title="安全校验" desc="正在确认绑定关系" :chev="false" />
    </view>
    <view class="section">
      <BigButton @click="go('/pages/login-guide/index')">完成绑定 ✓</BigButton>
    </view>
  </view>
</template>

<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import BigButton from '@/components/BigButton.vue'
import ListItem from '@/components/ListItem.vue'
import { goReplace } from '@/utils/navigate'

function go(url: string) {
  goReplace(url)
}
</script>

<style scoped>
.intro {
  line-height: 1.5;
}

.device-card {
  margin-top: 28px;
}

.qr {
  margin: 0 auto;
  width: 150px;
  height: 150px;
  border-radius: 42px;
  background: #fff;
  border: 1px solid #d6e8d4;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 42px;
  font-weight: 900;
  color: #315943;
}

.qr-title {
  margin-top: 18px;
}

.qr-copy {
  margin-top: 8px;
}
</style>
