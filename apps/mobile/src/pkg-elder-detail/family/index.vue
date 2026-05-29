<template>
  <view class="app-page">
    <AppHeader label="亲情联络" title="联系家人" back="/pages/home/index" compact />
    <view class="section">
      <view class="hero green">
        <view class="between row-top">
          <view>
            <view class="pill">{{ elder.onlineContactCount }} 位家人可联系</view>
            <view class="family-copy">女儿现在在线，可以直接视频。</view>
            <view class="muted family-desc">小鼋也可以帮您把想说的话转成消息发给家人。</view>
          </view>
          <view class="iconbox family-icon">家</view>
        </view>
        <view class="grid2 action-row">
          <BigButton @click="quickAction('video')">一键视频</BigButton>
          <BigButton tone="white" @click="quickAction('message')">发语音</BigButton>
        </view>
      </view>
    </view>
    <view class="section-title">
      <view class="h2">我的家人</view>
      <button class="link" @click="elder.contactActionMessage = '已进入添加家人演示流程'">添加 +</button>
    </view>
    <view class="section compact">
      <view class="grid3">
        <button
          v-for="contact in elder.profile.emergencyContacts"
          :key="contact.id"
          class="quick center family-card"
          :class="{ selected: elder.selectedContact.id === contact.id }"
          @click="openContact(contact.id)"
        >
          <text class="family-avatar">{{ contact.relation.slice(0, 1) }}</text>
          <text class="quick-title">{{ contact.relation }}</text>
          <text class="status" :class="{ warning: contact.onlineStatus === 'busy' }">{{ contact.onlineStatus === 'online' ? '在线' : contact.onlineStatus === 'busy' ? '忙碌' : '离线' }}</text>
        </button>
      </view>
    </view>
    <view class="section">
      <view class="card contact-detail">
        <view class="row">
          <view class="iconbox">{{ elder.selectedContact.relation.slice(0, 1) }}</view>
          <view class="item-main">
            <view class="contact-name">{{ elder.selectedContact.name }}</view>
            <view class="muted">最近联系：{{ elder.selectedContact.lastContactAt }}</view>
          </view>
          <StatusTag :label="elder.selectedContact.onlineStatus === 'offline' ? '离线' : '可联系'" />
        </view>
        <view class="grid3 contact-actions">
          <BigButton tone="white" class="small-action" @click="quickAction('phone')">电话</BigButton>
          <BigButton tone="warm" class="small-action" @click="quickAction('video')">视频</BigButton>
          <BigButton tone="white" class="small-action" @click="quickAction('message')">消息</BigButton>
        </view>
      </view>
    </view>
    <view class="section">
      <view class="hero warm">
        <view class="row row-top">
          <YuanMascot size="small" />
          <view>
            <view class="h2 relay-title">小鼋帮我转述</view>
            <view class="muted relay-copy">预设消息：{{ elder.relayMessage }}</view>
          </view>
        </view>
        <view class="relay-grid">
          <BigButton tone="white" @click="elder.contactActionMessage = '已开始录音演示'">按住说话</BigButton>
          <BigButton tone="warm" @click="elder.sendRelayMessage()">发送</BigButton>
        </view>
      </view>
    </view>
    <view v-if="elder.contactActionMessage" class="section">
      <view class="card feedback">{{ elder.contactActionMessage }}</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import BigButton from '@/components/BigButton.vue'
import StatusTag from '@/components/StatusTag.vue'
import YuanMascot from '@/components/YuanMascot.vue'
import { useElderStore } from '@/stores/elder'
import { goDetail } from '@/utils/navigate'

const elder = useElderStore()
if (!elder.selectedContactId) {
  elder.selectContact(elder.primaryContact.id)
}

function openContact(id: string) {
  elder.selectContact(id)
  goDetail(`/pkg-elder-detail/contact-detail/index?id=${id}`)
}

function quickAction(action: 'phone' | 'video' | 'message') {
  elder.simulateContactAction(action)
}
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
  font-size: 34px;
  font-weight: 900;
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
  font-weight: 900;
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
  grid-template-columns: 1fr 72px;
  gap: 12px;
  margin-top: 18px;
}

.feedback {
  padding: 12px 14px;
  color: #315943;
  font-weight: 900;
}
</style>
