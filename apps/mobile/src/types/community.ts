import type { HealthMetric } from '@/types/elder'

export type WorkOrderTab = 'urgent' | 'visit' | 'device' | 'done'
export type TagTone = 'normal' | 'warm' | 'red' | 'gray' | 'green'
export type WorkOrderStatus = 'pending' | 'processing' | 'resolved'

export type CommunitySite = {
  id: string
  name: string
  dutyStaff: string
  deviceOnlineRate: number
  serviceStatusLabel: string
}

export type DashboardStats = {
  pendingCount: number
  urgentCount: number
  visitCount: number
  activityCount: number
  doneCount: number
  totalCount: number
}

export type OpsMetric = {
  key: string
  icon: string
  iconTone?: TagTone
  title: string
  value: string
  statusLabel: string
  statusTone?: TagTone
}

export type UrgentWorkItem = {
  id: string
  icon: string
  iconTone: TagTone
  title: string
  description: string
  tag: string
  tagTone: TagTone
}

export type FocusElderItem = {
  elderId: string
  icon: string
  iconTone: TagTone
  name: string
  description: string
}

export type TodayActivityCard = {
  id: string
  title: string
  timeLabel: string
  location: string
  enrolled: number
  pendingCheckIn: number
  statusLabel: string
  statusTone: TagTone
}

export type WorkOrder = {
  id: string
  code: string
  tab: WorkOrderTab
  icon: string
  iconTone: TagTone
  title: string
  description: string
  tag: string
  tagTone: TagTone
  elderId?: string
  status: WorkOrderStatus
}

export type StaffDuty = {
  id: string
  name: string
  workload: string
  statusLabel: string
  statusTone: TagTone
}

export type CommunityActivityItem = {
  id: string
  icon: string
  iconTone?: TagTone
  title: string
  description: string
  tag: string
  tagTone: TagTone
  enrolled?: number
  checkedIn?: number
  pendingCheckIn?: number
}

export type ActivityOverview = {
  todayCount: number
  totalEnrolled: number
  inProgressCount: number
  pendingCheckInCount: number
  endedCount: number
  checkInTotal: number
  pointsLabel: string
}

export type CheckInRecord = {
  id: string
  elderName: string
  detail: string
  tag: string
  tagTone: TagTone
}

export type ElderServiceProfile = {
  elderId: string
  name: string
  age: number
  address: string
  tags: { label: string; tone: TagTone }[]
  healthScore: number
  alertCount: number
  serviceCount: number
  activityCount: number
  metrics: HealthMetric[]
  riskRecords: { id: string; icon: string; iconTone: TagTone; title: string; description: string; tag: string; tagTone: TagTone; workOrderId?: string }[]
  serviceRecords: { id: string; icon: string; title: string; detail: string }[]
  contacts: { id: string; name: string; role: string; iconTone?: TagTone; actionLabel: string; actionTone: 'warm' | 'green' }[]
  participation: { activityLabel: string; pointsLabel: string }
  yuanSuggestion: string
}

export type WorkOrderTimelineStep = {
  id: string
  title: string
  detail: string
  done: boolean
  pending?: boolean
}

export type WorkOrderDetail = {
  id: string
  code: string
  type: 'sos' | 'fall' | 'bp' | 'visit' | 'device' | 'other'
  priority: string
  priorityTone: TagTone
  elapsedLabel: string
  statusLabel: string
  statusTone: TagTone
  headline: string
  description: string
  elderId: string
  elderName: string
  elderAge: number
  elderTags: string[]
  location: string
  triggerTime: string
  triggerDetail: string
  liveMetrics: { key: string; icon: string; iconTone?: TagTone; label: string; value: string; unit?: string; status: string; statusTone?: TagTone }[]
  mapAddress: string
  mapDistance: string
  timeline: WorkOrderTimelineStep[]
  suggestion: string
  resultOptions: { id: string; icon: string; title: string; description: string }[]
  finishedHeadline: string
  finishedDescription: string
}
