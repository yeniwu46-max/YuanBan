<template>
  <view class="app-page">
    <AppHeader label="小鼋陪伴" title="今天想聊点什么？" />
    <view class="section">
      <view class="hero green">
        <view class="row row-top">
          <YuanMascot size="large" heart />
          <view class="item-main">
            <view class="pill">🔥 陪伴值 {{ companion.points }}</view>
            <view class="hero-copy">我在呢，您可以直接和我说话。</view>
            <view class="muted hero-desc">我会帮您记录心情，也可以帮您联系家人。</view>
          </view>
        </view>
        <view class="grid2 action-row">
          <BigButton>🎙 和小鼋说话</BigButton>
          <BigButton tone="white" @click="go('/pages/family/index')">📹 一键视频</BigButton>
        </view>
      </view>
    </view>
    <view class="section-title">
      <view class="h2">记录心情</view>
      <view class="muted mood-now">今天：{{ companion.selectedMood }}</view>
    </view>
    <view class="section compact">
      <view class="grid4">
        <button v-for="mood in moods" :key="mood.name" class="mood" :class="{ active: companion.selectedMood === mood.name }" @click="companion.setMood(mood.name)">
          <text class="mood-icon">{{ mood.icon }}</text>
          <text>{{ mood.name }}</text>
        </button>
      </view>
    </view>
    <view class="section">
      <view class="grid2">
        <button class="quick" @click="go('/pages/family/index')"><view class="iconbox warm">☎</view><view class="quick-title">联系家人</view><view class="muted mini-copy">给儿女打电话</view></button>
        <button class="quick"><view class="iconbox">🔊</view><view class="quick-title">家人留言</view><view class="muted mini-copy">听听新消息</view></button>
      </view>
    </view>
    <view class="section">
      <view class="card yuanqi-card">
        <view class="between">
          <view class="row">
            <view class="iconbox warm">🎁</view>
            <view>
              <view class="h2 yuanqi-title">鼋气罐</view>
              <view class="muted yuanqi-copy">今天还差 {{ companion.todayTotal - companion.todayDone }} 个小任务</view>
            </view>
          </view>
          <text class="chev">›</text>
        </view>
        <view class="hero warm progress-card">
          <view class="between"><text class="progress-title">今日进度</text><text class="progress-num">{{ companion.todayDone }} / {{ companion.todayTotal }}</text></view>
          <ProgressBar :value="companion.progressPercent" />
        </view>
      </view>
    </view>
    <BottomNav active="companion" />
  </view>
</template>

<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import BigButton from '@/components/BigButton.vue'
import BottomNav from '@/components/BottomNav.vue'
import ProgressBar from '@/components/ProgressBar.vue'
import YuanMascot from '@/components/YuanMascot.vue'
import { useCompanionStore } from '@/stores/companion'

const companion = useCompanionStore()
const moods = [
  { icon: '🌿', name: '安心' },
  { icon: '😊', name: '开心' },
  { icon: '🏠', name: '想家' },
  { icon: '☁️', name: '低落' }
]

function go(url: string) {
  uni.redirectTo({ url })
}
</script>

<style scoped>
.hero-copy {
  margin-top: 12px;
  font-size: 21px;
  line-height: 1.35;
  font-weight: 900;
}

.hero-desc {
  margin-top: 8px;
  line-height: 1.45;
}

.action-row {
  margin-top: 18px;
}

.mood-now {
  font-weight: 900;
}

.compact {
  margin-top: 0;
}

.mini-copy {
  font-size: 13px;
  margin-top: 5px;
}

.yuanqi-card {
  padding: 16px;
}

.yuanqi-title {
  font-size: 20px;
}

.yuanqi-copy {
  font-size: 14px;
  margin-top: 3px;
}

.progress-card {
  margin-top: 14px;
  border-radius: 22px;
  padding: 12px;
}

.progress-title,
.progress-num {
  font-weight: 900;
}

.progress-num {
  color: #c9822c;
}
</style>

