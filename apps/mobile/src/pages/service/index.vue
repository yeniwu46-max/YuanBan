<template>
  <view class="app-page">
    <AppHeader label="生活帮手" title="服务中心" />
    <view class="section">
      <view class="hero warm">
        <view class="between row-top">
          <view>
            <view class="pill service-pill">今日服务提醒</view>
            <view class="service-copy">今晚 18:30 有一次服药提醒，下午有社区活动。</view>
            <view class="muted service-desc">小鼋会帮您记着，也可以通知家人陪同。</view>
          </view>
          <view class="iconbox warm service-icon">药</view>
        </view>
      </view>
    </view>
    <view class="section-title">
      <view class="h2">常用服务</view>
    </view>
    <view class="list">
      <ListItem icon="药" icon-tone="warm" title="今日用药" desc="阿司匹林 1 片 · 晚间 18:30" tag="待提醒" tag-tone="warm" @click="go('/pages/medicine/index')" />
      <ListItem icon="动" title="社区活动" desc="舒缓太极课 · 社区活动室" tag="今天 15:00" @click="go('/pages/activity/index')" />
      <ListItem icon="设" title="设备状态" desc="监测设备在线，环境正常" tag="运行正常" @click="go('/pages/device/index')" />
      <ListItem icon="隐" title="隐私授权" desc="查看家人和社区可见范围" tag="可管理" @click="go('/pages/privacy/index')" />
    </view>
    <BottomNav active="service" />
  </view>
</template>

<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import BottomNav from '@/components/BottomNav.vue'
import ListItem from '@/components/ListItem.vue'
import { goDetail } from '@/utils/navigate'

function go(url: string) {
  goDetail(url)
}
</script>

<style scoped>
.service-pill {
  color: #8b6a33;
}

.service-copy {
  margin-top: 15px;
  font-size: 22px;
  line-height: 1.35;
  font-weight: 900;
}

.service-desc {
  margin-top: 8px;
  line-height: 1.45;
}

.service-icon {
  width: 84px;
  height: 84px;
  border-radius: 28px;
  font-size: 34px;
  font-weight: 900;
}
</style>
