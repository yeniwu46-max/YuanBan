import { apiRequest } from '@/services/apiClient'

export type WorkOrderDto = {
  id: string
  code: string
  elder_id: string | null
  alert_id: string | null
  tab: string
  icon: string
  title: string
  description: string
  tag: string
  tag_tone: string
  status: string
  created_at: string
}

export function listWorkOrders(tab?: string) {
  const q = tab ? `?tab=${encodeURIComponent(tab)}` : ''
  return apiRequest<WorkOrderDto[]>(`/api/v1/work-orders${q}`, { role: 'community', userId: 'community-001' })
}

export function finishWorkOrder(id: string) {
  return apiRequest<WorkOrderDto>(`/api/v1/work-orders/${id}`, {
    method: 'PATCH',
    role: 'community',
    userId: 'community-001',
    body: { status: 'resolved', tag: '已完成', tag_tone: 'green' }
  })
}

export function triggerSimulator(eventType: 'sos' | 'fall' | 'vitals' | 'offline' | 'low_battery', elderId = 'elder-001') {
  return apiRequest<{ ok: boolean; alert_id?: string }>('/api/v1/simulator/trigger', {
    method: 'POST',
    body: { event_type: eventType, elder_id: elderId, device_id: 'd3', location: '卧室' }
  })
}
