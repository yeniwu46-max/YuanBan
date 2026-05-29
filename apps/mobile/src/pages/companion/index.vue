<template>
  <view class="app-page">
    <AppHeader label="小鼋陪伴" title="今天想聊点什么？" />
    <view class="section">
      <view class="hero green">
        <view class="row row-top">
          <YuanMascot size="large" heart />
          <view class="item-main">
            <view class="pill">陪伴值 {{ companion.points }}</view>
            <view class="hero-copy">我在呢，您可以直接和我说话。</view>
            <view class="muted hero-desc">我会帮您记录心情，也可以帮您联系家人。</view>
          </view>
        </view>
        <view class="grid2 action-row">
          <BigButton @click="companion.startVoiceChat()">和小鼋说话</BigButton>
          <BigButton tone="white" @click="companion.askHealthSummary()">问身体情况</BigButton>
        </view>
        <view v-if="companion.voiceState" class="card feedback">{{ companion.voiceState }}</view>
      </view>
    </view>

    <view class="section">
      <view class="card chat-card">
        <view class="chat-list">
          <view
            v-for="message in companion.chatMessages"
            :key="message.id"
            class="chat-row"
            :class="message.role"
          >
            <view class="chat-bubble">{{ message.text }}</view>
          </view>
        </view>
        <view class="quick-prompts">
          <button class="prompt" @click="ask('我今天有点想家', 'care')">有点想家</button>
          <button class="prompt" @click="ask('今天身体怎么样？', 'health')">身体情况</button>
          <button class="prompt emergency" @click="ask('我摔倒了，胸闷喘不过气', 'chat')">紧急演示</button>
        </view>
        <view class="chat-input-row">
          <input
            class="chat-input"
            :value="companion.chatInput"
            confirm-type="send"
            placeholder="和小鼋说句话"
            @input="onInput"
            @confirm="send"
          />
          <button class="send-btn" :disabled="companion.loading" @click="send">
            {{ companion.loading ? '...' : '发送' }}
          </button>
        </view>
        <view v-if="companion.aiError" class="muted error-copy">云端暂不可用，已使用本地兜底回应。</view>
      </view>
    </view>

    <view v-if="companion.suggestedActions.length" class="section compact">
      <view class="grid2">
        <button
          v-for="action in companion.suggestedActions"
          :key="action.key"
          class="quick suggestion-action"
          @click="openAction(action.route)"
        >
          <view class="iconbox" :class="{ warm: companion.safetyLevel !== 'normal' }">{{ action.key === 'sos' ? 'SOS' : '去' }}</view>
          <view class="quick-title">{{ action.label }}</view>
          <view class="muted mini-copy">{{ companion.safetyLevel === 'emergency' ? '优先处理安全' : '小鼋建议' }}</view>
        </button>
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
          <text class="mood-label">{{ mood.name }}</text>
        </button>
      </view>
    </view>
    <view class="section">
      <view class="grid2">
        <button class="quick" @click="go('/pkg-elder-detail/family/index')"><view class="iconbox warm">联</view><view class="quick-title">联系家人</view><view class="muted mini-copy">给儿女打电话</view></button>
        <button class="quick" @click="companion.playFamilyMessage()"><view class="iconbox">信</view><view class="quick-title">家人留言</view><view class="muted mini-copy">听听新消息</view></button>
      </view>
    </view>
    <view class="section">
      <button class="card yuanqi-card" @click="go('/pkg-elder-detail/yuanqi/index')">
        <view class="between">
          <view class="row">
            <view class="iconbox warm">罐</view>
            <view>
              <view class="h2 yuanqi-title">鼋气罐</view>
              <view class="muted yuanqi-copy">今天还差 {{ companion.unfinishedTasks.length }} 个小任务</view>
            </view>
          </view>
          <text class="chev">›</text>
        </view>
        <view class="hero warm progress-card">
          <view class="between"><text class="progress-title">今日进度</text><text class="progress-num">{{ companion.todayDone }} / {{ companion.todayTotal }}</text></view>
          <ProgressBar :value="companion.progressPercent" />
        </view>
      </button>
    </view>
    <view v-if="companion.messageState" class="section">
      <view class="card feedback">{{ companion.messageState }}</view>
    </view></view>
</template>

<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import BigButton from '@/components/BigButton.vue'
import ProgressBar from '@/components/ProgressBar.vue'
import YuanMascot from '@/components/YuanMascot.vue'
import { useCompanionStore } from '@/stores/companion'
import { goDetail } from '@/utils/navigate'
import type { CompanionScene } from '@/services/companionService'

const companion = useCompanionStore()
const moods = [
  { icon: '安', name: '安心' },
  { icon: '乐', name: '开心' },
  { icon: '家', name: '想家' },
  { icon: '低', name: '低落' }
]

function go(url: string) {
  goDetail(url)
}

function onInput(event: Event) {
  const payload = event as Event & {
    detail?: { value?: string }
    target?: { value?: string }
  }
  companion.setChatInput(payload.detail?.value ?? payload.target?.value ?? '')
}

function send() {
  void companion.sendCurrentMessage()
}

function ask(message: string, scene: CompanionScene) {
  void companion.sendMessage(message, scene)
}

function openAction(route?: string | null) {
  if (route) {
    go(route)
  }
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

.feedback {
  margin-top: 12px;
  padding: 12px 14px;
  color: #315943;
  font-weight: 900;
}

.chat-card {
  padding: 16px;
}

.chat-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chat-row {
  display: flex;
}

.chat-row.user {
  justify-content: flex-end;
}

.chat-bubble {
  max-width: 82%;
  border-radius: 20px;
  background: #f7f2e8;
  padding: 12px 14px;
  line-height: 1.45;
  font-size: 16px;
  color: #243a31;
  font-weight: 800;
}

.chat-row.user .chat-bubble {
  background: #315943;
  color: white;
}

.quick-prompts {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.prompt {
  min-height: 38px;
  border-radius: 18px;
  background: #f7f2e8;
  border: 1px solid #efe3ce;
  padding: 0 12px;
  color: #315943;
  font-weight: 900;
  font-size: 13px;
}

.prompt.emergency {
  color: #b84d44;
}

.chat-input-row {
  display: flex;
  gap: 8px;
  margin-top: 14px;
}

.chat-input {
  flex: 1;
  height: 46px;
  border-radius: 20px;
  background: #fffdf7;
  border: 1px solid #efe3ce;
  padding: 0 14px;
  font-size: 16px;
  color: #243a31;
}

.send-btn {
  width: 72px;
  height: 46px;
  border-radius: 20px;
  background: #315943;
  color: white;
  font-size: 15px;
  font-weight: 1000;
}

.send-btn[disabled] {
  opacity: 0.6;
}

.error-copy {
  margin-top: 10px;
  font-size: 13px;
}

.mood-now {
  font-weight: 900;
}

.mood {
  min-height: 106px;
  height: auto;
  padding: 12px 6px;
  border-radius: 24px;
  gap: 9px;
}

.mood-icon {
  display: flex;
  width: 52px;
  height: 52px;
  border-radius: 18px;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.78);
  font-size: 34px;
  line-height: 1;
  color: #315943;
}

.mood-label {
  display: block;
  width: 100%;
  line-height: 1.1;
  font-size: 14px;
  font-weight: 1000;
  text-align: center;
  white-space: nowrap;
}

.compact {
  margin-top: 0;
}

.mini-copy {
  font-size: 13px;
  margin-top: 5px;
}

.suggestion-action {
  text-align: left;
}

.yuanqi-card {
  width: 100%;
  padding: 16px;
  text-align: left;
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
