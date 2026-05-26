import { useApiMode } from '@/config/apiMode'
import {
  communityActivity,
  devices,
  elderProfile,
  healthMetricDetails,
  healthMetrics,
  medicines,
  privacyPermissions,
  yuanqiProgress,
  yuanqiTasks
} from '@/mock/elder'
import { apiRequest } from '@/services/apiClient'
import { mockClone } from '@/services/mockClone'
import {
  mapElderDtoToProfile,
  mapHealthMetricDto,
  mergeHealthMetrics
} from '@/utils/apiMappers'
import type { ElderProfile, HealthMetric, SosState } from '@/types/elder'

export type ElderDto = {
  id: string
  name: string
  age: number
  location_label: string
  address: string
  community_site_id: string | null
}

export type HealthMetricDto = {
  key: string
  label: string
  value: string
  unit: string
  status: string
  description: string
}

let sosState: SosState = 'confirm'
let activityJoined = false

const ELDER_ID = 'elder-001'

export function fetchElderApi(elderId = ELDER_ID) {
  return apiRequest<ElderDto>(`/api/v1/elders/${elderId}`, {
    role: 'elder',
    userId: 'user-elder-001'
  })
}

export function fetchElderMetricsApi(elderId = ELDER_ID) {
  return apiRequest<HealthMetricDto[]>(`/api/v1/elders/${elderId}/metrics/latest`, {
    role: 'elder',
    userId: 'user-elder-001'
  })
}

export async function loadElderProfileFromApi(elderId = ELDER_ID): Promise<ElderProfile> {
  const dto = await fetchElderApi(elderId)
  return mapElderDtoToProfile(dto)
}

export async function loadHealthMetricsFromApi(elderId = ELDER_ID): Promise<HealthMetric[]> {
  const dtos = await fetchElderMetricsApi(elderId)
  return mergeHealthMetrics(dtos.map(mapHealthMetricDto))
}

export function getElderProfile() {
  return mockClone(elderProfile)
}

export function getHealthMetrics() {
  return mockClone(healthMetrics)
}

export function getHealthMetricDetail(key: HealthMetric['key']) {
  return mockClone(healthMetricDetails.find((item) => item.key === key))
}

export function getMedicines() {
  return mockClone(medicines)
}

export function getDevices() {
  return mockClone(devices)
}

export function getPrivacyPermissions() {
  return mockClone(privacyPermissions)
}

export function getYuanqiProgress() {
  return mockClone(yuanqiProgress)
}

export function getCommunityActivity() {
  return mockClone(communityActivity)
}

export function getActivityJoined() {
  return activityJoined
}

export function updateActivityJoined(joined: boolean) {
  activityJoined = joined
  return activityJoined
}

export function getYuanqiTasks() {
  return mockClone(yuanqiTasks)
}

export function updateYuanqiTask(taskId: string, done: boolean) {
  const target = yuanqiTasks.find((item) => item.id === taskId)
  if (target) {
    target.done = done
  }
  return getYuanqiTasks()
}

export function updatePrivacyPermission(key: string, enabled: boolean) {
  const target = privacyPermissions.find((item) => item.key === key)
  if (target) {
    target.enabled = enabled
  }
  return getPrivacyPermissions()
}

export function updateSosState(state: SosState) {
  sosState = state
  return sosState
}

export function getSosState() {
  return sosState
}

export async function hydrateElderProfile(elderId = ELDER_ID) {
  if (!useApiMode()) {
    return getElderProfile()
  }
  return loadElderProfileFromApi(elderId)
}

export async function hydrateHealthMetrics(elderId = ELDER_ID) {
  if (!useApiMode()) {
    return getHealthMetrics()
  }
  return loadHealthMetricsFromApi(elderId)
}
