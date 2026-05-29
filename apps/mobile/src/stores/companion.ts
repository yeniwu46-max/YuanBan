import { defineStore } from 'pinia'
import {
  getPrivacyPermissions,
  getYuanqiProgress,
  getYuanqiTasks,
  updatePrivacyPermission,
  updateYuanqiTask
} from '@/services/elderService'
import { sendCompanionChat, type CompanionScene, type CompanionSuggestedAction } from '@/services/companionService'

const yuanqiProgress = getYuanqiProgress()

export type CompanionChatMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
}

export const useCompanionStore = defineStore('companion', {
  state: () => ({
    selectedMood: yuanqiProgress.mood,
    points: yuanqiProgress.points,
    todayDone: yuanqiProgress.todayDone,
    todayTotal: yuanqiProgress.todayTotal,
    privacyPermissions: getPrivacyPermissions(),
    tasks: getYuanqiTasks(),
    voiceState: '',
    messageState: '',
    chatInput: '',
    chatMessages: [
      {
        id: 'welcome',
        role: 'assistant' as const,
        text: '我在呢。您可以和我说说心情，也可以问问今天身体情况。'
      }
    ] as CompanionChatMessage[],
    suggestedActions: [] as CompanionSuggestedAction[],
    safetyLevel: 'normal' as 'normal' | 'attention' | 'emergency',
    loading: false,
    aiError: ''
  }),
  getters: {
    progressPercent: (state) => Math.round((state.todayDone / state.todayTotal) * 100),
    unfinishedTasks: (state) => state.tasks.filter((item) => !item.done)
  },
  actions: {
    async setMood(mood: string) {
      this.selectedMood = mood
      this.messageState = `已记录今天心情：${mood}`
      await this.sendMessage(`我今天感觉${mood}`, 'mood')
    },
    togglePermission(key: string) {
      const permission = this.privacyPermissions.find((item) => item.key === key)
      if (!permission) return
      permission.enabled = !permission.enabled
      updatePrivacyPermission(key, permission.enabled)
    },
    startVoiceChat() {
      this.voiceState = '小鼋已准备好，您可以输入想说的话'
    },
    playFamilyMessage() {
      this.messageState = '女儿留言：妈，晚上我再和您视频。'
    },
    completeTask(taskId: string) {
      const task = this.tasks.find((item) => item.id === taskId)
      if (!task || task.done) return
      task.done = true
      this.points += task.points
      this.todayDone = Math.min(this.todayDone + 1, this.todayTotal)
      this.tasks = updateYuanqiTask(taskId, true)
      this.messageState = `已完成“${task.title}”，鼋气 +${task.points}`
    },
    setChatInput(value: string) {
      this.chatInput = value
    },
    async sendCurrentMessage(scene: CompanionScene = 'chat') {
      const message = this.chatInput.trim()
      if (!message || this.loading) return
      this.chatInput = ''
      await this.sendMessage(message, scene)
    },
    async askHealthSummary() {
      await this.sendMessage('今天身体怎么样？', 'health')
    },
    async sendMessage(message: string, scene: CompanionScene = 'chat') {
      const text = message.trim()
      if (!text || this.loading) return
      this.loading = true
      this.aiError = ''
      this.chatMessages.push({
        id: `user-${Date.now()}`,
        role: 'user',
        text
      })
      try {
        const response = await sendCompanionChat({
          message: text,
          mood: this.selectedMood,
          scene,
          role: 'elder',
          elder_id: 'elder-001'
        })
        this.chatMessages.push({
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: response.reply
        })
        this.voiceState = `小鼋播报：${response.speak_text}`
        this.messageState = response.reply
        this.suggestedActions = response.suggested_actions
        this.safetyLevel = response.safety_level
      } catch (e) {
        this.aiError = e instanceof Error ? e.message : '小鼋暂时连不上'
        const fallback = '小鼋暂时连不上云端，但我还在。您可以稍后再试，紧急情况请直接联系家人或按 SOS。'
        this.chatMessages.push({
          id: `assistant-error-${Date.now()}`,
          role: 'assistant',
          text: fallback
        })
        this.voiceState = fallback
        this.messageState = fallback
        this.suggestedActions = [{ key: 'sos', label: '去 SOS', route: '/pkg-elder-detail/sos/index' }]
        this.safetyLevel = 'attention'
      } finally {
        this.loading = false
      }
    }
  }
})
