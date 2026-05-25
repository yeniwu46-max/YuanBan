import type { AlertEvent, AlertLevel, AlertStatus } from '@/types/family'
import type { DashboardStats, TagTone, WorkOrder, WorkOrderStatus, WorkOrderTab } from '@/types/community'
import type { WorkOrderDto } from '@/services/communityService'
import type { AlertDto } from '@/services/familyService'

const tagTones = new Set<TagTone>(['normal', 'warm', 'red', 'gray', 'green'])

function asTagTone(value: string | undefined, fallback: TagTone = 'normal'): TagTone {
  if (value && tagTones.has(value as TagTone)) return value as TagTone
  return fallback
}

export function mapWorkOrderDto(dto: WorkOrderDto): WorkOrder {
  return {
    id: dto.id,
    code: dto.code,
    tab: dto.tab as WorkOrderTab,
    icon: dto.icon,
    iconTone: asTagTone(dto.tag_tone, 'normal'),
    title: dto.title,
    description: dto.description,
    tag: dto.tag,
    tagTone: asTagTone(dto.tag_tone, 'normal'),
    elderId: dto.elder_id ?? undefined,
    status: dto.status as WorkOrderStatus
  }
}

export function computePoolStats(orders: WorkOrder[]): DashboardStats {
  const urgent = orders.filter((o) => o.tab === 'urgent' && o.status !== 'resolved')
  const visit = orders.filter((o) => o.tab === 'visit')
  const done = orders.filter((o) => o.tab === 'done' || o.status === 'resolved')
  const pending = orders.filter((o) => o.tab !== 'done' && o.status !== 'resolved')
  return {
    pendingCount: pending.length,
    urgentCount: urgent.length,
    visitCount: visit.length,
    activityCount: 2,
    doneCount: done.length,
    totalCount: orders.length
  }
}

export function mapAlertDto(dto: AlertDto): AlertEvent {
  const level = (['low', 'medium', 'high'].includes(dto.level) ? dto.level : 'medium') as AlertLevel
  const status = (['pending', 'viewed', 'processing', 'resolved'].includes(dto.status)
    ? dto.status
    : 'pending') as AlertStatus
  return {
    id: dto.id,
    elderId: dto.elder_id,
    type: dto.type ?? dto.alert_type ?? 'unknown',
    level,
    icon: dto.icon,
    title: dto.title,
    description: dto.description,
    detail: dto.detail,
    timeLabel: dto.time_label ?? '',
    status,
    statusLabel: dto.status_label,
    tag: dto.tag,
    tagTone: asTagTone(dto.tag_tone, 'normal') as AlertEvent['tagTone'],
    timeline: (dto.timeline ?? []).map((step, index) => ({
      id: step.id ?? `t${index + 1}`,
      title: step.title,
      detail: step.detail,
      done: Boolean(step.done),
      pending: step.pending
    })),
    suggestion: dto.suggestion ?? ''
  }
}
