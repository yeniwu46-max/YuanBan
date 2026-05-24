<template>
  <view class="app-page">
    <AppHeader label="亲情联络" title="联系家人" back="/pages/home/index" compact />
    <view class="section">
      <view class="hero green">
        <view class="between row-top">
          <view>
            <view class="pill">👥 {{ elder.onlineContactCount }} 位家人可联系</view>
            <view class="family-copy">女儿现在在线，可以直接视频。</view>
            <view class="muted family-desc">小鼋也可以帮您把想说的话转成消息发给家人。</view>
          </view>
          <view class="iconbox family-icon">👪</view>
        </view>
        <view class="grid2 action-row">
          <BigButton>📹 一键视频</BigButton>
          <BigButton tone="white">🎙 发语音</BigButton>
        </view>
      </view>
    </view>
    <view class="section-title">
      <view class="h2">我的家人</view>
      <button class="link">添加 +</button>
    </view>
    <view class="section compact">
      <view class="grid3">
        <button v-for="contact in elder.profile.emergencyContacts" :key="contact.id" class="quick center family-card" :class="{ selected: contact.onlineStatus === 'online' }">
          <text class="family-avatar">{{ contact.relation === '女儿' ? '👩' : contact.relation === '儿子' ? '👨' : '👴' }}</text>
          <text class="quick-title">{{ contact.relation }}</text>
          <text class="status" :class="{ warning: contact.onlineStatus === 'busy' }">{{ contact.onlineStatus === 'busy' ? '忙碌' : '在线' }}</text>
        </button>
      </view>
    </view>
    <view class="section">
      <view class="card contact-detail">
        <view class="row">
          <view class="iconbox">👩</view>
          <view class="item-main">
            <view class="contact-name">女儿</view>
            <view class="muted">最近联系：{{ elder.primaryContact.lastContactAt }}</view>
          </view>
          <StatusTag label="可联系" />
        </view>
        <view class="grid3 contact-actions">
          <BigButton tone="white" class="small-action">☎ 电话</BigButton>
          <BigButton tone="warm" class="small-action">📹 视频</BigButton>
          <BigButton tone="white" class="small-action">💬 消息</BigButton>
        </view>
      </view>
    </view>
    <view class="section">
      <view class="hero warm">
        <view class="row row-top">
          <YuanMascot size="small" />
          <view>
            <view class="h2 relay-title">小鼋帮我转述</view>
            <view class="muted relay-copy">您可以直接说：“我今天挺好的，晚饭后想出去走走。”</view>
          </view>
        </view>
        <view class="relay-grid">
          <BigButton tone="white">🎙 按住说话</BigButton>
          <BigButton tone="warm">➤</BigButton>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import BigButton from '@/components/BigButton.vue'
import StatusTag from '@/components/StatusTag.vue'
import YuanMascot from '@/components/YuanMascot.vue'
import { useElderStore } from '@/stores/elder'

const elder = useElderStore()
</script>

<style scoped>
.family-copy {
  margin-top: 15px;
  font-size: 24px;
  line-height: 1.3;
  font-weight: 900;
}

.family-desc {
  margin-top: 8px;
  line-height: 1.45;
}

.family-icon {
  width: 86px;
  height: 86px;
  border-radius: 28px;
  font-size: 42px;
}

.action-row {
  margin-top: 18px;
}

.compact {
  margin-top: 0;
}

.family-card {
  min-height: 106px;
}

.family-card.selected {
  background: #e7f3df;
}

.family-avatar {
  font-size: 24px;
}

.contact-detail {
  padding: 16px;
}

.contact-name {
  font-size: 20px;
  font-weight: 900;
}

.contact-actions {
  margin-top: 14px;
}

.small-action {
  min-height: 72px;
  font-size: 14px;
  flex-direction: column;
}

.relay-title {
  font-size: 18px;
}

.relay-copy {
  margin-top: 6px;
  line-height: 1.5;
}

.relay-grid {
  display: grid;
  grid-template-columns: 1fr 54px;
  gap: 12px;
  margin-top: 18px;
}
</style>

