<template>
  <AppPage class="">
    <AppHeader title="小鼋陪伴" />
    <view class="section">
      <AquaHero :state="mascotState" title="我在呢">
        <view class="pill">陪伴值 {{ companion.points }}</view>
        <template #footer>
          <view class="grid2 action-row">
            <BigButton tone="white" @click="companion.startVoiceChat()"><AppIcon name="mic" />说说话</BigButton>
            <BigButton tone="white" @click="companion.askHealthSummary()">问健康</BigButton>
          </view>
          <view v-if="companion.voiceState" class="card feedback" role="status">{{ companion.voiceState }}</view>
        </template>
      </AquaHero>
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
            @focus="inputFocused=true"
            @blur="inputFocused=false"
          />
          <button class="send-btn" :disabled="companion.loading" @click="send">
            {{ companion.loading ? '...' : '发送' }}
          </button>
        </view>
        <view v-if="companion.aiError" class="muted error-copy">云端不可用，当前为本地回复。</view>
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
          <view class="iconbox" :class="{ warm: companion.safetyLevel !== 'normal' }"><AppIcon :name="action.key === 'sos' ? 'siren' : 'arrow'" /></view>
          <view class="quick-title">{{ action.label }}</view>

        </button>
      </view>
    </view>

    <view class="section-title">
      <view class="h2">记录心情</view>
      <view class="muted mood-now text-nowrap">今天：{{ companion.selectedMood }}</view>
    </view>
    <view class="section compact">
      <view class="grid4">
        <button v-for="mood in moods" :key="mood.name" class="mood" :class="{ active: companion.selectedMood === mood.name, 'mood--loading': companion.moodLoading && companion.selectedMood === mood.name }" :disabled="companion.moodLoading" @click="companion.setMood(mood.name)">
          <text class="mood-icon"><AppIcon :name="mood.icon" /></text>
          <text class="mood-label">{{ mood.name }}</text>
        </button>
      </view>
    </view>
    <view class="section">
      <view class="grid2">
        <button class="quick" @click="go('/pkg-elder-detail/family/index')"><view class="iconbox warm"><AppIcon name="联" /></view><view class="quick-title">联系家人</view></button>
        <button class="quick" @click="companion.playFamilyMessage()"><view class="iconbox"><AppIcon name="信" /></view><view class="quick-title">家人留言</view></button>
      </view>
    </view>
    <view class="section">
      <button class="card yuanqi-card" @click="go('/pkg-elder-detail/yuanqi/index')">
        <view class="between">
          <view class="row">
            <view class="iconbox warm"><AppIcon name="罐" /></view>
            <view>
              <view class="h2 yuanqi-title">鼋气罐</view>
              <view class="muted yuanqi-copy">今天还差 {{ companion.unfinishedTasks.length }} 个小任务</view>
            </view>
          </view>
          <AppIcon name="chevron" />
        </view>
        <view class="hero warm progress-card">
          <view class="between"><text class="progress-title">今日进度</text><text class="progress-num">{{ companion.todayDone }} / {{ companion.todayTotal }}</text></view>
          <ProgressBar :value="companion.progressPercent" />
        </view>
      </button>
    </view>
    <view v-if="companion.messageState" class="section">
      <view class="card feedback">{{ companion.messageState }}</view>
    </view></AppPage>
</template>

<script setup lang="ts">
import { computed, ref as vueRef } from 'vue'
const inputFocused = vueRef(false)
import AppHeader from '@/components/AppHeader.vue'
import AquaHero from '@/components/AquaHero.vue'
import BigButton from '@/components/BigButton.vue'
import ProgressBar from '@/components/ProgressBar.vue'
import YuanMascot from '@/components/YuanMascot.vue'
import { useCompanionStore } from '@/stores/companion'
import { goDetail, goFromCompanionAction } from '@/utils/navigate'
import type { CompanionScene } from '@/services/companionService'
import type { MascotState } from '@/types/presentation'

const companion = useCompanionStore()
const mascotState = computed<MascotState>(() => {
  if (companion.safetyLevel === 'emergency') return 'reminder'
  if (companion.loading) return 'thinking'
  if (inputFocused.value) return 'listening'
  if (['想家', '低落'].includes(companion.selectedMood)) return 'caring'
  if (companion.safetyLevel === 'attention') return 'reminder'
  if (companion.selectedMood === '开心') return 'encouraging'
  return 'greeting'
})
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
  goFromCompanionAction(route)
}
</script>

<style scoped lang="scss">
@import '@/styles/motion.scss';

.hero-copy {
  margin-top: 12px;
  font-size: 21px;
  line-height: 1.35;
  font-weight: 600;
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
  color: var(--primary);
  font-weight: 600;
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
  background: var(--bg);
  padding: 12px 14px;
  line-height: 1.45;
  font-size: var(--body-size);
  color: var(--text);
  font-weight: 600;
}

.chat-row.user .chat-bubble {
  background: var(--primary);
  color: white;
}

.quick-prompts {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.prompt {
  min-height: 48px;
  border-radius: 18px;
  background: var(--bg);
  border: 1px solid var(--line);
  padding: 0 12px;
  color: var(--primary);
  font-weight: 600;
  font-size: var(--helper-size, 16px);
  white-space: nowrap;
  @include pressable-sm;
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
  min-width: 0;
  height: 56px;
  border-radius: 20px;
  background: var(--bg);
  border: 1px solid var(--line);
  padding: 0 14px;
  font-size: 16px;
  color: var(--text);
}

.send-btn {
  width: 72px;
  height: 56px;
  border-radius: 20px;
  background: var(--primary);
  color: white;
  font-size: var(--helper-size, 16px);
  font-weight: 600;
  @include pressable-sm;
}

.send-btn[disabled] {
  opacity: 0.6;
  &:active { transform: none !important; }
}

.error-copy {
  margin-top: 10px;
  font-size: var(--helper-size, 16px);
}

.mood-now {
  font-weight: 600;
}

.mood {
  min-height: 106px;
  height: auto;
  padding: 12px 6px;
  border-radius: 24px;
  gap: 9px;
}

.mood--loading {
  opacity: 0.6;
  cursor: wait;
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
  color: var(--primary);
}

.mood-label {
  display: block;
  width: 100%;
  line-height: 1.1;
  font-size: var(--helper-size, 16px);
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
}

.compact {
  margin-top: 0;
}

.mini-copy {
  font-size: var(--helper-size, 16px);
  margin-top: 5px;
}

.suggestion-action {
  text-align: left;
  @include pressable-sm;
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
  font-size: var(--helper-size, 16px);
  margin-top: 3px;
}

.progress-card {
  margin-top: 14px;
  border-radius: 22px;
  padding: 12px;
}

.progress-title,
.progress-num {
  font-weight: 600;
}

.progress-num {
  color: var(--warm);
}
</style>
