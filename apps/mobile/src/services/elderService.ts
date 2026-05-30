import { useApiMode } from '@/config/apiMode'
import { getApiAuthOptions, getPrimaryElderId } from '@/utils/authContext'
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
import { cachedFetch, type HydrateOptions } from '@/services/requestCache'
import { mockClone } from '@/services/mockClone'
import {
  mapElderDtoToProfile,
  mapHealthMetricDto,
  mergeHealthMetrics
} from '@/utils/apiMappers'
import type { ElderProfile, HealthMetric, MedicineReminder, SosState } from '@/types/elder'

export type ElderDto = {
  id: string
  name: string
  age: number
  location_label: string
  address: string
  community_site_id: string | null
  guard_score?: number
  device_count?: number
  online_status?: string
  emergency_contact?: string
  emergency_phone?: string
}

export type HealthMetricDto = {
  key: string
  label: string
  value: string
  unit: string
  status: string
  description: string
}

export type DeviceDto = {
  id: string
  elder_id: string
  name: string
  location: string
  online: boolean
  battery_percent: number | null
  status: string
}

let sosState: SosState = 'confirm'
let activityJoined = false

export function fetchElderApi(elderId?: string) {
  const id = elderId ?? getPrimaryElderId()
  return apiRequest<ElderDto>(`/api/v1/elders/${id}`, getApiAuthOptions())
}

export function fetchElderMetricsApi(elderId?: string) {
  const id = elderId ?? getPrimaryElderId()
  return apiRequest<HealthMetricDto[]>(`/api/v1/elders/${id}/metrics/latest`, getApiAuthOptions())
}

export function fetchMetricHistoryApi(elderId: string, metricKey: string, days = 7) {
  return apiRequest<Array<{ recorded_at: string; value: string; status: string }>>(
    `/api/v1/elders/${elderId}/metrics/${metricKey}/history?days=${days}`,
    getApiAuthOptions()
  )
}

export async function loadElderProfileFromApi(elderId?: string): Promise<ElderProfile> {
  const dto = await fetchElderApi(elderId)
  return mapElderDtoToProfile(dto)
}

export async function loadHealthMetricsFromApi(elderId?: string): Promise<HealthMetric[]> {
  const dtos = await fetchElderMetricsApi(elderId)
  return dtos.map(mapHealthMetricDto)
}

export function fetchElderDevicesApi(elderId?: string) {
  const id = elderId ?? getPrimaryElderId()
  return apiRequest<DeviceDto[]>(`/api/v1/elders/${id}/devices`, getApiAuthOptions())
}

export function fetchMedicinesApi(elderId?: string) {
  const id = elderId ?? getPrimaryElderId()
  return apiRequest<Array<{ id: string; name: string; dose: string; schedule: string; status: string }>>(
    `/api/v1/elders/${id}/medicines`,
    getApiAuthOptions()
  )
}

export function patchMedicineApi(elderId: string, medicineId: string, status: string) {
  return apiRequest(`/api/v1/elders/${elderId}/medicines/${medicineId}`, {
    method: 'PATCH',
    body: { status },
    ...getApiAuthOptions()
  })
}

export function fetchServiceSummaryApi(elderId?: string) {
  const id = elderId ?? getPrimaryElderId()
  return apiRequest<{
    abnormal_metric_count: number
    online_device_count: number
    total_device_count: number
    recent_activity_label: string
    companion_mood: string
    companion_score: number
  }>(`/api/v1/elders/${id}/service-summary`, getApiAuthOptions())
}

export function fetchCompanionStateApi(elderId?: string) {
  const id = elderId ?? getPrimaryElderId()
  return apiRequest<{ mood: string; companion_score: number; speak_hint: string }>(
    `/api/v1/elders/${id}/companion-state`,
    getApiAuthOptions()
  )
}

export function patchCompanionStateApi(elderId: string, body: { mood?: string; companion_score?: number }) {
  return apiRequest<{ mood: string; companion_score: number; speak_hint: string }>(
    `/api/v1/elders/${elderId}/companion-state`,
    {
      method: 'PATCH',
      body,
      ...getApiAuthOptions()
    }
  )
}

export function fetchPrivacyPermissionsApi(elderId?: string) {
  const id = elderId ?? getPrimaryElderId()
  return apiRequest<Array<{ key: string; label: string; description: string; enabled: boolean }>>(
    `/api/v1/elders/${id}/privacy-permissions`,
    getApiAuthOptions()
  )
}

export function patchPrivacyPermissionsApi(
  elderId: string,
  permissions: Array<{ key: string; label: string; description: string; enabled: boolean }>
) {
  return apiRequest<Array<{ key: string; label: string; description: string; enabled: boolean }>>(
    `/api/v1/elders/${elderId}/privacy-permissions`,
    {
      method: 'PATCH',
      body: { permissions },
      ...getApiAuthOptions()
    }
  )
}

export function fetchCommunityActivityApi(activityId: string) {
  return apiRequest<
    Array<{
      id: string
      title: string
      time_label: string
      location: string
      enrolled: number
      pending_check_in: number
      status_label: string
      status_tone: string
    }>
  >('/api/v1/community/activities', getApiAuthOptions()).then((rows) => rows.find((a) => a.id === activityId) ?? null)
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

export async function hydrateElderProfile(elderId?: string, options: HydrateOptions = {}) {
  const id = elderId ?? getPrimaryElderId()
  return cachedFetch(`elder:profile:${id}`, async () => {
    if (!useApiMode()) {
      return getElderProfile()
    }
    return loadElderProfileFromApi(id)
  }, options)
}

export async function hydrateHealthMetrics(elderId?: string, options: HydrateOptions = {}) {
  const id = elderId ?? getPrimaryElderId()
  return cachedFetch(`elder:metrics:${id}`, async () => {
    if (!useApiMode()) {
      return getHealthMetrics()
    }
    return loadHealthMetricsFromApi(id)
  }, options)
}

export async function hydrateMedicines(elderId?: string, options: HydrateOptions = {}) {
  const id = elderId ?? getPrimaryElderId()
  return cachedFetch(`elder:medicines:${id}`, async () => {
    if (!useApiMode()) {
      return getMedicines()
    }
    const rows = await fetchMedicinesApi(id)
    return rows.map(
      (m): MedicineReminder => ({
        id: m.id,
        name: m.name,
        time: m.schedule,
        dosage: m.dose,
        note: '',
        status: m.status as MedicineReminder['status']
      })
    )
  }, options)
}

export async function hydrateDevices(elderId?: string, options: HydrateOptions = {}) {
  const id = elderId ?? getPrimaryElderId()
  return cachedFetch(`elder:devices:${id}`, async () => {
    if (!useApiMode()) {
      return getDevices()
    }
    const rows = await fetchElderDevicesApi(id)
    return rows.map((d) => ({
      id: d.id,
      name: d.name,
      location: d.location,
      online: d.online,
      batteryPercent: d.battery_percent ?? undefined,
      status: d.status as 'normal' | 'warning' | 'offline'
    }))
  }, options)
}

export async function hydrateServiceSummary(elderId?: string, options: HydrateOptions = {}) {
  const id = elderId ?? getPrimaryElderId()
  return cachedFetch(`elder:service-summary:${id}`, async () => {
    if (!useApiMode()) {
      return {
        abnormalMetricCount: 0,
        onlineDeviceCount: devices.filter((d) => d.online).length,
        totalDeviceCount: devices.length,
        recentActivityLabel: '舒缓太极课 · 今天 15:00',
        companionMood: '平稳',
        companionScore: 78
      }
    }
    const dto = await fetchServiceSummaryApi(id)
    return {
      abnormalMetricCount: dto.abnormal_metric_count,
      onlineDeviceCount: dto.online_device_count,
      totalDeviceCount: dto.total_device_count,
      recentActivityLabel: dto.recent_activity_label,
      companionMood: dto.companion_mood,
      companionScore: dto.companion_score
    }
  }, options)
}

export async function hydrateCompanionState(elderId?: string, options: HydrateOptions = {}) {
  const id = elderId ?? getPrimaryElderId()
  return cachedFetch(`elder:companion-state:${id}`, async () => {
    if (!useApiMode()) {
      return {
        mood: getYuanqiProgress().mood,
        companionScore: getYuanqiProgress().points,
        speakHint: '今天记得多喝水',
        tasks: getYuanqiTasks(),
        privacyPermissions: getPrivacyPermissions()
      }
    }
    const [state, tasks, privacy] = await Promise.all([
      fetchCompanionStateApi(id),
      fetchCareTasksForYuanqi(id),
      fetchPrivacyPermissionsApi(id)
    ])
    return {
      mood: state.mood,
      companionScore: state.companion_score,
      speakHint: state.speak_hint,
      tasks,
      privacyPermissions: privacy.map((p) => ({
        key: p.key,
        title: p.label,
        description: p.description,
        enabled: p.enabled
      }))
    }
  }, options)
}

async function fetchCareTasksForYuanqi(elderId: string) {
  const { fetchCareTasksApi } = await import('@/services/familyService')
  const rows = await fetchCareTasksApi(elderId)
  return rows.map((t, index) => ({
    id: t.id,
    icon: t.icon.replace(/[^\u4e00-\u9fa5A-Za-z]/g, '').slice(0, 1) || '任',
    title: t.title,
    description: t.description,
    points: 5 + index * 5,
    done: t.status === 'done'
  }))
}
