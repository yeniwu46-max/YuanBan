import { useSessionStore } from '@/stores/session'
import type { ApiRole } from '@/services/apiClient'

export function getApiAuthOptions(): { role?: ApiRole; userId?: string } {
  const session = useSessionStore()
  if (session.authenticated && session.userId) {
    return {}
  }
  const roleMap: Record<string, ApiRole> = {
    elder: 'elder',
    family: 'family',
    community: 'community'
  }
  const fallbackIds: Record<string, string> = {
    elder: 'user-elder-001',
    family: 'family-001',
    community: 'community-001'
  }
  const role = roleMap[session.role] ?? 'elder'
  return { role, userId: fallbackIds[role] }
}

export function getPrimaryElderId() {
  const session = useSessionStore()
  return session.primaryElderId
}
