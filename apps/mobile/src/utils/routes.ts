/** 分包页面路径常量，避免硬编码散落 */
export const ROUTES = {
  sos: '/pkg-elder-detail/sos/index',
  healthMetric: '/pkg-elder-detail/health-metric/index',
  bp: '/pkg-elder-detail/bp/index',
  medicine: '/pkg-elder-detail/medicine/index',
  healthReport: '/pkg-elder-detail/health-report/index',
  device: '/pkg-elder-detail/device/index',
  deviceDetail: '/pkg-elder-detail/device-detail/index',
  contactDetail: '/pkg-elder-detail/contact-detail/index',
  privacy: '/pkg-elder-detail/privacy/index',
  yuanqi: '/pkg-elder-detail/yuanqi/index',
  activity: '/pkg-elder-detail/activity/index',
  elderFamily: '/pkg-elder-detail/family/index',
  familyAlert: '/pkg-family-detail/family/alert/index',
  communityAlert: '/pkg-community-detail/community/alert/index',
  home: '/pages/home/index',
  health: '/pages/health/index',
  companion: '/pages/companion/index',
  service: '/pages/service/index',
  familyGuardian: '/pages/family/guardian/index',
  familyReport: '/pages/family/report/index',
  familyCare: '/pages/family/care/index',
  familySettings: '/pages/family/settings/index',
  communityDashboard: '/pages/community/dashboard/index',
  communityWorkorders: '/pages/community/workorders/index',
  communityActivity: '/pages/community/activity/index',
  communityProfile: '/pages/community/profile/index'
} as const

export function contactDetail(id?: string) {
  return id ? `${ROUTES.contactDetail}?id=${id}` : ROUTES.contactDetail
}

export function healthMetric(key: string) {
  return `${ROUTES.healthMetric}?key=${key}`
}

export function deviceDetail(id: string) {
  return `${ROUTES.deviceDetail}?id=${id}`
}

export function communityAlert(id: string) {
  return `${ROUTES.communityAlert}?id=${id}`
}

export function familyAlert(alertId?: string) {
  return alertId ? `${ROUTES.familyAlert}?id=${encodeURIComponent(alertId)}` : ROUTES.familyAlert
}

export function elderActivity(id: string) {
  return `${ROUTES.activity}?id=${encodeURIComponent(id)}`
}

export function withQuery(path: string, params: Record<string, string | undefined>) {
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value!)}`)
    .join('&')
  return query ? `${path}?${query}` : path
}
