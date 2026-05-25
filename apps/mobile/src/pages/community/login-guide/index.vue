<template>
  <view class="app-page login-page community-page">
    <AppHeader label="新手引导" title="社区服务，从这 3 步开始" back="/pages/login-profile/index" />
    <view class="list guide-list">
      <ListItem icon="⌂" title="看服务工作台" desc="掌握今日工单、紧急告警与运营概览。" :chev="false" />
      <ListItem icon="▤" icon-tone="warm" title="处理工单" desc="按优先级处理 SOS、上门与设备类工单。" :chev="false" />
      <ListItem icon="📅" title="活动签到" desc="管理社区活动报名与现场签到核销。" :chev="false" />
    </view>
    <view class="section">
      <view class="hero warm">
        <view class="row row-top">
          <YuanMascot size="small" />
          <view>
            <view class="h2 guide-title">小鼋会帮您高效派单</view>
            <view class="muted guide-copy">紧急工单优先提醒，处理结果会同步给子女端。</view>
          </view>
        </view>
      </view>
    </view>
    <view class="section">
      <BigButton @click="enter">进入服务工作台 ⌂</BigButton>
    </view>
  </view>
</template>

<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import BigButton from '@/components/BigButton.vue'
import ListItem from '@/components/ListItem.vue'
import YuanMascot from '@/components/YuanMascot.vue'
import { goHome } from '@/utils/navigate'

function enter() {
  goHome('/pages/community/dashboard/index')
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
