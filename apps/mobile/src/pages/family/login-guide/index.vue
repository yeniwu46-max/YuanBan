<template>
  <AppPage class=" login-page family-page">
    <AppHeader title="家人使用指南" back="/pages/login-profile/index" />
    <view class="list guide-list">
      <ListItem icon="🛡️" title="看守护首页" desc="随时查看老人安全状态和风险提醒。" :chev="false" />
      <ListItem icon="⚠️" icon-tone="warm" title="处理告警" desc="收到告警后，及时联系老人。" :chev="false" />
      <ListItem icon="💚" title="主动关怀" desc="视频、电话或传照片，让小鼋帮你们保持联系。" :chev="false" />
    </view>
    <view class="section">
      <view class="hero warm">
        <view class="row row-top">
          <YuanMascot size="small" />
          <view>
            <view class="h2 guide-title">小鼋会帮您一起守护</view>

          </view>
        </view>
      </view>
    </view>
    <view class="section">
      <BigButton @click="go('/pages/family/guardian/index')">进入守护首页 ⌂</BigButton>
    </view>
  </AppPage>
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
