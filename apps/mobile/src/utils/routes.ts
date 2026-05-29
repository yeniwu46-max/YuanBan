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
  communityAlert: '/pkg-community-detail/community/alert/index'
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

export function familyAlert(query?: string) {
  return query ? `${ROUTES.familyAlert}?${query}` : ROUTES.familyAlert
}
