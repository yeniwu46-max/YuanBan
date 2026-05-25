import {
  communityActivity,
  devices,
  elderProfile,
  healthMetricDetails,
  healthMetrics,
  medicines,
  privacyPermissions,
  yuanqiTasks,
  yuanqiProgress
} from '@/mock/elder'
import { mockClone } from '@/services/mockClone'
import type { HealthMetric, SosState } from '@/types/elder'

let sosState: SosState = 'confirm'
let activityJoined = false

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
