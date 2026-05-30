import { defineStore } from 'pinia'
import {
  demoPhoneForRole,
  fetchMe,
  logoutLocal,
  sendPhoneOtp,
  verifyPhoneLogin
} from '@/services/authService'
import { setUnauthorizedHandler } from '@/services/apiClient'
import { configureTabBarForRole, getDefaultHomeShell } from '@/utils/tabBar'
import { goReplace } from '@/utils/navigate'
import { prefetchForRole } from '@/services/prefetch'
import type { UserRole } from '@/types/family'

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

export type SessionUser = {
  id: string
  phone: string
  name: string
  elderId: string | null
  boundElderIds: string[]
}

export const useSessionStore = defineStore('session', {
  state: () => ({
    role: 'elder' as UserRole,
    user: null as SessionUser | null,
    authenticated: false,
    restoring: false
  }),
  getters: {
    isElder: (state) => state.role === 'elder',
    isFamily: (state) => state.role === 'family',
    isCommunity: (state) => state.role === 'community',
    phoneTitle: (state) => rolePhoneTitleMap[state.role],
    homePath: (state) => getDefaultHomeShell(state.role),
    afterProfilePath: (state) => roleAfterProfileMap[state.role],
    primaryElderId: (state) => state.user?.elderId ?? state.user?.boundElderIds[0] ?? 'elder-001',
    userId: (state) => state.user?.id ?? ''
  },
  actions: {
    setRole(role: UserRole) {
      this.role = role
      configureTabBarForRole(role)
    },
    homePathForRole(role?: UserRole) {
      return getDefaultHomeShell(role ?? this.role)
    },
    mapAuthUser(user: Awaited<ReturnType<typeof fetchMe>>) {
      this.user = {
        id: user.id,
        phone: user.phone,
        name: user.name,
        elderId: user.elder_id ?? null,
        boundElderIds: user.bound_elders.map((e) => e.id)
      }
      this.role = user.role
      this.authenticated = true
      configureTabBarForRole(this.role)
    },
    async restoreSession() {
      this.restoring = true
      setUnauthorizedHandler(() => {
        this.logout(false)
      })
      try {
        const me = await fetchMe()
        this.mapAuthUser(me)
        return true
      } catch {
        this.authenticated = false
        this.user = null
        return false
      } finally {
        this.restoring = false
      }
    },
    async requestOtp(phone?: string) {
      const target = (phone ?? demoPhoneForRole(this.role)).replace(/\s/g, '')
      await sendPhoneOtp(target, this.role)
      return target
    },
    async loginWithOtp(code: string, phone?: string) {
      const target = (phone ?? demoPhoneForRole(this.role)).replace(/\s/g, '')
      const res = await verifyPhoneLogin(target, code, this.role)
      this.mapAuthUser(res.user)
      void prefetchForRole()
      return res
    },
    logout(navigate = true) {
      logoutLocal()
      this.authenticated = false
      this.user = null
      if (navigate) {
        goReplace('/pages/login-welcome/index')
      }
    }
  }
})
