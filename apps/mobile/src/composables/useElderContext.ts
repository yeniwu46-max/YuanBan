import { computed } from 'vue'
import { useSessionStore } from '@/stores/session'
import { useFamilyElderContext } from '@/composables/useFamilyElderContext'

/** 老人/社区端用 session；子女端用 guardian 当前老人 */
export function useElderContext() {
  const session = useSessionStore()

  if (session.isFamily) {
    const family = useFamilyElderContext()
    return {
      elderId: family.elderId,
      elder: family.elder,
      isFamily: true as const
    }
  }

  const elderId = computed(() => session.primaryElderId)

  return {
    elderId,
    elder: computed(() => undefined),
    isFamily: false as const
  }
}

export function resolveElderId(explicit?: string) {
  const session = useSessionStore()
  if (explicit) return explicit
  if (session.isFamily) {
    return useFamilyElderContext().elderId.value
  }
  return session.primaryElderId
}
