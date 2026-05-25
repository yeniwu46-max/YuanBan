import type { HealthMetric } from '@/types/elder'

export type UserRole = 'elder' | 'family' | 'community'
export type ApiReportPeriod = 'day' | 'week' | 'month'

export type FamilyContactRole = 'primary' | 'secondary'

export type FamilyProfile = {
  id: string
  name: string
  relation: string
  phone: string
  role: FamilyContactRole
}

export type SafetyStatus = 'safe' | 'attention' | 'danger'

export type BoundElder = {
  id: string
  name: string
  age: number
  locationLabel: string
  online: boolean
  guardScore: number
  healthScore: number
  deviceCount: number
  riskCount: number
  medicineDonePercent: number
  lastSyncLabel: string
  activityLabel: string
  safetyStatus: SafetyStatus
  safetyHeadline: string
}

export type GuardSummary = {
  elderId: string
  guardScore: number
  deviceCount: number
  riskCount: number
  medicineDonePercent: number
  lastSyncLabel: string
  activityLabel: string
  safetyStatus: SafetyStatus
  safetyHeadline: string
  companionSuggestion: string
}

export type AlertLevel = 'low' | 'medium' | 'high'
export type AlertStatus = 'pending' | 'viewed' | 'processing' | 'resolved'

export type AlertTimelineStep = {
  id: string
  title: string
  detail: string
  done: boolean
  pending?: boolean
}

export type AlertEvent = {
  id: string
  elderId: string
  type: string
  level: AlertLevel
  icon: string
  title: string
  description: string
  detail: string
  timeLabel: string
  status: AlertStatus
  statusLabel: string
  tag: string
  tagTone: 'normal' | 'warm' | 'red' | 'gray'
  timeline: AlertTimelineStep[]
  suggestion: string
}

export type ReportPeriod = 'daily' | 'weekly' | 'monthly'

export type HealthReportSummary = {
  elderId: string
  period: ReportPeriod
  healthScore: number
  headline: string
  summary: string
  riskCount: number
  medicineDonePercent: number
  avgSleepHours: number
  deviceStatusLabel: string
  yuanInterpretation: string
  familyAdvice: string
  metrics: HealthMetric[]
}

export type CareTaskStatus = 'done' | 'pending'

export type CareTask = {
  id: string
  elderId: string
  icon: string
  iconTone?: 'warm' | 'red' | 'gray' | ''
  title: string
  description: string
  status: CareTaskStatus
}

export type CareStats = {
  elderId: string
  companionPoints: number
  weeklyContacts: number
  albumUpdates: number
  headline: string
  suggestion: string
  generatedGreeting: string
  doneCount: number
  totalCount: number
}

export type AlbumPhoto = {
  id: string
  emoji: string
  label: string
}

export type NotificationRule = {
  key: string
  icon: string
  iconTone?: 'warm' | 'red' | 'gray' | ''
  title: string
  description: string
  enabled: boolean
}

export type ReportAnomaly = {
  id: string
  elderId: string
  icon: string
  iconTone?: 'warm' | 'red' | 'gray' | ''
  title: string
  description: string
  tag: string
  tagTone: 'normal' | 'warm' | 'red' | 'gray'
  alertId?: string
}

export type RecommendedAction = {
  id: string
  icon: string
  iconTone?: 'warm' | 'red' | 'gray' | ''
  title: string
  description: string
}
