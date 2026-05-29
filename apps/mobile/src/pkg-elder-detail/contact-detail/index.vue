<template>
  <view class="app-page">
    <AppHeader label="亲情联络" title="联系人详情" back="/pkg-elder-detail/family/index" compact />
    <view class="scroll-section">
      <view class="hero green">
        <view class="center">
          <view class="avatar">{{ contact.relation.slice(0, 1) }}</view>
          <view class="contact-name">{{ contact.name }}</view>
          <view class="muted contact-meta">{{ contact.relation }} · {{ statusLabel }}</view>
          <view class="muted contact-meta">最近联系：{{ contact.lastContactAt }}</view>
        </view>
        <view class="grid3 actions">
          <BigButton tone="white" class="action-btn" @click="act('phone')">电话</BigButton>
          <BigButton tone="warm" class="action-btn" @click="act('video')">视频</BigButton>
          <BigButton tone="white" class="action-btn" @click="act('message')">消息</BigButton>
        </view>
      </view>
      <view class="hero warm relay">
        <view class="h2 relay-title">小鼋帮我转述</view>
        <view class="muted relay-copy">{{ elder.relayMessage }}</view>
        <view class="grid2 relay-actions">
          <BigButton tone="white" @click="elder.contactActionMessage = '已开始录音演示'">按住说话</BigButton>
          <BigButton tone="warm" @click="elder.sendRelayMessage(undefined, contact.id)">发送</BigButton>
        </view>
      </view>
      <view v-if="elder.contactActionMessage" class="card feedback">{{ elder.contactActionMessage }}</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import AppHeader from '@/components/AppHeader.vue'
import BigButton from '@/components/BigButton.vue'
import { useElderStore } from '@/stores/elder'

const elder = useElderStore()
const contactId = ref(elder.primaryContact.id)
const contact = computed(() => elder.contactById(contactId.value) ?? elder.primaryContact)
const statusLabel = computed(() => (contact.value.onlineStatus === 'online' ? '在线' : contact.value.onlineStatus === 'busy' ? '忙碌' : '离线'))

onLoad((query) => {
  if (query?.id) {
    contactId.value = String(query.id)
    elder.selectContact(contactId.value)
  }
})

function act(action: 'phone' | 'video' | 'message') {
  elder.simulateContactAction(action, contact.value.id)
}
</script>

<style scoped>
.avatar {
  width: 108px;
  height: 108px;
  margin: 0 auto;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #315943;
  font-size: 42px;
  font-weight: 900;
}

.contact-name {
  margin-top: 16px;
  font-size: 30px;
  font-weight: 900;
}

.contact-meta {
  margin-top: 6px;
}

.actions {
  margin-top: 20px;
}

.action-btn {
  min-height: 70px;
  font-size: 16px;
}

.relay {
  margin-top: 18px;
}

.relay-title {
  font-size: 19px;
}

.relay-copy {
  margin-top: 8px;
  line-height: 1.5;
}

.relay-actions {
  margin-top: 16px;
}

.feedback {
  margin-top: 16px;
  padding: 12px 14px;
  color: #315943;
  font-weight: 900;
}
</style>
