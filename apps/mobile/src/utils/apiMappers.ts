import { elderProfile, healthMetrics as mockHealthMetrics } from '@/mock/elder'
import type { ElderProfile, HealthMetric } from '@/types/elder'
import type { AlertEvent, AlertLevel, AlertStatus, BoundElder, GuardSummary, SafetyStatus } from '@/types/family'
import type { ElderDto, HealthMetricDto } from '@/services/elderService'
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

export function mapElderDtoToProfile(dto: ElderDto): ElderProfile {
  return {
    id: dto.id,
    name: dto.name,
    age: dto.age,
    locationLabel: dto.location_label,
    emergencyContacts: elderProfile.emergencyContacts.map((c) => ({ ...c }))
  }
}

export function mapHealthMetricDto(dto: HealthMetricDto): HealthMetric {
  const status = (['normal', 'warning', 'danger'].includes(dto.status)
    ? dto.status
    : 'normal') as HealthMetric['status']
  const key = dto.key as HealthMetric['key']
  const numeric = Number(dto.value)
  const value = Number.isFinite(numeric) && dto.value === String(numeric) ? numeric : dto.value
  return {
    key,
    label: dto.label,
    value,
    unit: dto.unit || undefined,
    status,
    description: dto.description
  }
}

export function mergeHealthMetrics(apiRows: HealthMetric[]): HealthMetric[] {
  const keys = new Set(apiRows.map((m) => m.key))
  const extras = mockHealthMetrics.filter((m) => !keys.has(m.key))
  return [...apiRows, ...extras]
}

export function mergeBoundElderFromApi(
  dto: ElderDto,
  template: BoundElder,
  activeAlertCount: number
): BoundElder {
  const safetyStatus: SafetyStatus =
    activeAlertCount >= 2 ? 'danger' : activeAlertCount >= 1 ? 'attention' : 'safe'
  return {
    ...template,
    id: dto.id,
    name: dto.name,
    age: dto.age,
    locationLabel: dto.location_label,
    guardScore: dto.guard_score ?? template.guardScore,
    deviceCount: dto.device_count ?? template.deviceCount,
    online: dto.online_status ? dto.online_status === 'online' : template.online,
    riskCount: activeAlertCount,
    safetyStatus,
    safetyHeadline:
      activeAlertCount > 0
        ? `${dto.name}有 ${activeAlertCount} 条待处理提醒，建议尽快查看。`
        : `${dto.name}今日状态良好，守护设备正常运行。`
  }
}

export function mergeGuardSummaryFromApi(
  elder: BoundElder,
  template: GuardSummary,
  activeAlertCount: number
): GuardSummary {
  return {
    ...template,
    elderId: elder.id,
    guardScore: elder.guardScore,
    deviceCount: elder.deviceCount,
    riskCount: activeAlertCount,
    medicineDonePercent: elder.medicineDonePercent,
    lastSyncLabel: elder.lastSyncLabel,
    activityLabel: elder.activityLabel,
    safetyStatus: elder.safetyStatus,
    safetyHeadline: elder.safetyHeadline,
    companionSuggestion:
      activeAlertCount > 0
        ? '有待处理告警，建议先确认老人当前状态并电话问候。'
        : template.companionSuggestion
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
