import { useApiMode } from '@/config/apiMode'
import { apiRequest } from '@/services/apiClient'

export type CompanionScene = 'chat' | 'mood' | 'health' | 'care'
export type CompanionSafetyLevel = 'normal' | 'attention' | 'emergency'

export type CompanionSuggestedAction = {
  key: string
  label: string
  route?: string | null
}

export type CompanionChatRequest = {
  elder_id?: string
  role?: 'elder' | 'family' | 'community'
  message: string
  mood?: string | null
  scene?: CompanionScene
}

export type CompanionChatResponse = {
  reply: string
  speak_text: string
  suggested_actions: CompanionSuggestedAction[]
  safety_level: CompanionSafetyLevel
}

export async function sendCompanionChat(body: CompanionChatRequest): Promise<CompanionChatResponse> {
  if (!useApiMode()) {
    return mockCompanionChat(body)
  }
  return apiRequest<CompanionChatResponse>('/api/v1/companion/chat', {
    method: 'POST',
    role: body.role ?? 'elder',
    userId: 'user-elder-001',
    body: {
      elder_id: body.elder_id ?? 'elder-001',
      role: body.role ?? 'elder',
      message: body.message,
      mood: body.mood ?? null,
      scene: body.scene ?? 'chat'
    }
  })
}

function mockCompanionChat(body: CompanionChatRequest): CompanionChatResponse {
  const text = `${body.message} ${body.mood ?? ''}`
  const emergency = /摔倒|跌倒|胸闷|胸痛|喘不过气|呼吸困难|SOS|救命/.test(text)
  const attention = /低落|想家|头晕|难受|孤独|血压/.test(text)
  if (emergency) {
    const reply = '这可能比较紧急。请您先别移动，马上按 SOS，或让家人、社区人员帮您联系急救。'
    return {
      reply,
      speak_text: reply,
      safety_level: 'emergency',
      suggested_actions: [
        { key: 'sos', label: '去 SOS', route: '/pkg-elder-detail/sos/index' },
        { key: 'family', label: '联系家人', route: '/pkg-elder-detail/family/index' }
      ]
    }
  }
  if (body.scene === 'health' || text.includes('身体') || text.includes('健康')) {
    const reply = '我看了今天的健康摘要，整体还算平稳。您要是哪里不舒服，记得马上告诉家人。'
    return {
      reply,
      speak_text: reply,
      safety_level: attention ? 'attention' : 'normal',
      suggested_actions: [{ key: 'report', label: '健康报告', route: '/pkg-elder-detail/health-report/index' }]
    }
  }
  const reply = body.mood
    ? `已记录您今天的心情：${body.mood}。我在呢，也可以帮您联系家人聊一会儿。`
    : '我在呢，您可以慢慢说。我会陪着您，也会在需要时提醒家人。'
  return {
    reply,
    speak_text: reply,
    safety_level: attention ? 'attention' : 'normal',
    suggested_actions: [{ key: 'family', label: '联系家人', route: '/pkg-elder-detail/family/index' }]
  }
}
