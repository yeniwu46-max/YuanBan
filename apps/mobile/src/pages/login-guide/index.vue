<template>
  <view class="app-page login-page">
    <AppHeader label="新手引导" title="记住这 3 个按钮就够了" back="/pages/login-device/index" />
    <view class="list guide-list">
      <ListItem icon="🛡️" title="看安全状态" desc="首页第一张卡片会告诉您今天是否安全。" :chev="false" />
      <ListItem icon="☎" icon-tone="red" title="SOS 求助" desc="遇到不舒服或摔倒，按红色按钮通知家人。" :chev="false" />
      <ListItem icon="🎙" title="和小鼋说话" desc="不会点按钮时，可以直接叫“小鼋小鼋”。" :chev="false" />
    </view>
    <view class="section">
      <view class="hero warm">
        <view class="row row-top">
          <YuanMascot size="small" />
          <view>
            <view class="h2 guide-title">小鼋会一直陪着您</view>
            <view class="muted guide-copy">您不用记太多功能，我会在合适的时候提醒您。</view>
          </view>
        </view>
      </view>
    </view>
    <view class="section">
      <BigButton @click="go('/pages/home/index')">进入首页 ⌂</BigButton>
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

