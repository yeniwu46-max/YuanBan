import { defineStore } from 'pinia'
import {
  getPrivacyPermissions,
  getYuanqiProgress,
  getYuanqiTasks,
  updatePrivacyPermission,
  updateYuanqiTask
} from '@/services/elderService'

const yuanqiProgress = getYuanqiProgress()

export const useCompanionStore = defineStore('companion', {
  state: () => ({
    selectedMood: yuanqiProgress.mood,
    points: yuanqiProgress.points,
    todayDone: yuanqiProgress.todayDone,
    todayTotal: yuanqiProgress.todayTotal,
    privacyPermissions: getPrivacyPermissions(),
    tasks: getYuanqiTasks(),
    voiceState: '',
    messageState: ''
  }),
  getters: {
    progressPercent: (state) => Math.round((state.todayDone / state.todayTotal) * 100),
    unfinishedTasks: (state) => state.tasks.filter((item) => !item.done)
  },
  actions: {
    setMood(mood: string) {
      this.selectedMood = mood
      this.messageState = `已记录今天心情：${mood}`
    },
    togglePermission(key: string) {
      const permission = this.privacyPermissions.find((item) => item.key === key)
      if (!permission) return
      permission.enabled = !permission.enabled
      updatePrivacyPermission(key, permission.enabled)
    },
    startVoiceChat() {
      this.voiceState = '小鼋已在听，您可以直接说话'
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
    }
  }
})
