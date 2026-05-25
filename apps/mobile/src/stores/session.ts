import { defineStore } from 'pinia'
import type { UserRole } from '@/types/family'

const roleHomeMap: Record<UserRole, string> = {
  elder: '/pages/home/index',
  family: '/pages/family/guardian/index',
  community: '/pages/community/dashboard/index'
}

const roleAfterProfileMap: Record<UserRole, string> = {
  elder: '/pages/login-device/index',
  family: '/pages/family/login-guide/index',
  community: '/pages/community/login-guide/index'
}

const rolePhoneTitleMap: Record<UserRole, string> = {
  elder: '欢迎使用老人端',
  family: '欢迎使用子女端',
  community: '欢迎使用社区端'
}

export const useSessionStore = defineStore('session', {
  state: () => ({
    role: 'elder' as UserRole
  }),
  getters: {
    isElder: (state) => state.role === 'elder',
    isFamily: (state) => state.role === 'family',
    isCommunity: (state) => state.role === 'community',
    phoneTitle: (state) => rolePhoneTitleMap[state.role],
    homePath: (state) => roleHomeMap[state.role],
    afterProfilePath: (state) => roleAfterProfileMap[state.role]
  },
  actions: {
    setRole(role: UserRole) {
      this.role = role
    }
  }
})
