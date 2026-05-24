<template>
  <view class="app-page">
    <AppHeader label="社区服务" title="活动详情" back="/pages/service/index" compact />
    <view class="scroll-section">
      <view class="hero green">
        <view class="between row-top">
          <view>
            <view class="pill">📅 {{ activity.timeLabel }}</view>
            <view class="activity-title">{{ activity.title }}</view>
            <view class="muted activity-desc">{{ activity.description }}</view>
          </view>
          <view class="iconbox activity-icon">☯</view>
        </view>
        <view class="grid3 activity-stats">
          <view class="card stat-card"><view class="muted">地点</view><view class="h2">活动室</view></view>
          <view class="card stat-card"><view class="muted">时长</view><view class="h2">{{ activity.duration }}</view></view>
          <view class="card stat-card"><view class="muted">积分</view><view class="h2">+{{ activity.points }}</view></view>
        </view>
      </view>
      <view class="section-title flush-title"><view class="h2">活动信息</view></view>
      <view class="list flush">
        <ListItem icon="📍" title="活动地点" :desc="activity.location" :chev="false" />
        <ListItem icon="👥" title="适合人群" desc="轻度活动能力老人，可由家人陪同" :chev="false" />
        <ListItem icon="🎁" icon-tone="warm" title="参与奖励" :desc="`完成活动后获得鼋气罐 +${activity.points}`" :chev="false" />
      </view>
      <view class="hero warm activity-tip">
        <view class="row row-top">
          <YuanMascot size="small" />
          <view>
            <view class="h2 tip-title">小鼋提醒</view>
            <view class="muted tip-copy">出门前记得带水杯。如果需要，我可以提醒女儿陪您一起去。</view>
          </view>
        </view>
      </view>
      <view class="grid2 activity-actions">
        <BigButton>报名参加</BigButton>
        <BigButton tone="white" @click="go('/pages/family/index')">通知家人</BigButton>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { communityActivity as activity } from '@/mock/elder'
import AppHeader from '@/components/AppHeader.vue'
import BigButton from '@/components/BigButton.vue'
import ListItem from '@/components/ListItem.vue'
import YuanMascot from '@/components/YuanMascot.vue'

function go(url: string) {
  uni.redirectTo({ url })
}
</script>

<style scoped>
.activity-title {
  margin-top: 15px;
  font-size: 29px;
  line-height: 1.15;
  font-weight: 900;
}

.activity-desc {
  margin-top: 8px;
  line-height: 1.5;
}

.activity-icon {
  width: 84px;
  height: 84px;
  border-radius: 28px;
  font-size: 42px;
}

.activity-stats {
  margin-top: 16px;
}

.stat-card {
  padding: 12px;
  text-align: center;
}

.flush-title {
  padding: 0;
}

.activity-tip {
  margin-top: 18px;
}

.tip-title {
  font-size: 18px;
}

.tip-copy {
  margin-top: 6px;
  line-height: 1.5;
}

.activity-actions {
  margin-top: 18px;
}
</style>

