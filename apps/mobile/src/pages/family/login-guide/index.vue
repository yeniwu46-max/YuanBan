<template>
  <view class="app-page login-page family-page">
    <AppHeader label="新手引导" title="远程守护，从这 3 步开始" back="/pages/login-profile/index" />
    <view class="list guide-list">
      <ListItem icon="🛡️" title="看守护首页" desc="随时查看老人安全状态和风险提醒。" :chev="false" />
      <ListItem icon="⚠️" icon-tone="warm" title="处理告警" desc="收到 SOS 或体征异常时，10 秒内确认并联系老人。" :chev="false" />
      <ListItem icon="💚" title="主动关怀" desc="视频、电话或传照片，让小鼋帮你们保持联系。" :chev="false" />
    </view>
    <view class="section">
      <view class="hero warm">
        <view class="row row-top">
          <YuanMascot size="small" />
          <view>
            <view class="h2 guide-title">小鼋会帮您一起守护</view>
            <view class="muted guide-copy">您不用记太多功能，重要事件会第一时间通知您。</view>
          </view>
        </view>
      </view>
    </view>
    <view class="section">
      <BigButton @click="go('/pages/family/guardian/index')">进入守护首页 ⌂</BigButton>
    </view>
  </view>
</template>

<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import BigButton from '@/components/BigButton.vue'
import ListItem from '@/components/ListItem.vue'
import YuanMascot from '@/components/YuanMascot.vue'
import { goHome } from '@/utils/navigate'

function go(url: string) {
  goHome(url)
}
</script>

<style scoped>
.guide-list {
  margin-top: 26px;
}

.guide-title {
  font-size: 18px;
}

.guide-copy {
  margin-top: 6px;
  line-height: 1.5;
}
</style>
