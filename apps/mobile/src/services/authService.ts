import { apiRequest, clearAccessToken, setAccessToken } from '@/services/apiClient'
import type { ApiRole } from '@/services/apiClient'
import type { UserRole } from '@/types/family'

export type AuthUser = {
  id: string
  phone: string
  name: string
  role: UserRole
  avatar_url?: string | null
  community_site_id?: string | null
  elder_id?: string | null
  bound_elders: Array<{
    id: string
    name: string
    age: number
    location_label: string
    guard_score?: number
    device_count?: number
    online_status?: string
  }>
}

export type TokenResponse = {
  access_token: string
  token_type: string
  user: AuthUser
}

const DEMO_PHONES: Record<UserRole, string> = {
  elder: '13800000001',
  family: '13000000000',
  community: '13900000001'
}

export function demoPhoneForRole(role: UserRole) {
  return DEMO_PHONES[role]
}

export async function sendPhoneOtp(phone: string, role: UserRole) {
  return apiRequest<{ ok: boolean; message: string }>('/api/v1/auth/phone/otp', {
    method: 'POST',
    skipAuth: true,
    body: { phone: phone.replace(/\s/g, ''), role }
  })
}

export async function verifyPhoneLogin(phone: string, code: string, role: UserRole, name?: string) {
  const res = await apiRequest<TokenResponse>('/api/v1/auth/phone/verify', {
    method: 'POST',
    skipAuth: true,
    body: { phone: phone.replace(/\s/g, ''), code, role, name }
  })
  setAccessToken(res.access_token)
  return res
}

export async function wechatLogin(code: string, role: UserRole) {
  const res = await apiRequest<TokenResponse>('/api/v1/auth/wechat/login', {
    method: 'POST',
    skipAuth: true,
    body: { code, role }
  })
  setAccessToken(res.access_token)
  return res
}

export async function fetchMe() {
  return apiRequest<AuthUser>('/api/v1/auth/me')
}

export async function bindElder(elderId: string, relation = '家属') {
  return apiRequest<AuthUser>('/api/v1/auth/bind-elder', {
    method: 'POST',
    body: { elder_id: elderId, relation }
  })
}

export function logoutLocal() {
  clearAccessToken()
}

export function roleToApiRole(role: UserRole): ApiRole {
  return role
}
